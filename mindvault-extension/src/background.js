const chrome = globalThis.chrome

let activeTabInfo = null // { tabId, url, startTime, windowId }
let lastWindowFocusTime = null // Timestamp when the browser window last gained focus

// Function to update time spent for a URL
async function updateWebsiteTime(url, durationMs) {
  if (!url || durationMs <= 0) return

  const result = await chrome.storage.local.get(["websites"])
  const websites = result.websites || []

  const existingIndex = websites.findIndex((item) => item.url === url)
  if (existingIndex !== -1) {
    const website = websites[existingIndex]
    website.totalTimeSpent = (website.totalTimeSpent || 0) + durationMs
    // No need to move to front here, onUpdated handles that for last visited time
  } else {
    // This path is for new URLs that somehow weren't caught by onUpdated first,
    // or if a tab was active before onUpdated fired for it.
    // We should ensure it gets added with its time.
    websites.unshift({
      id: Date.now().toString(),
      url: url,
      title: "Unknown Title", // Fallback
      timestamp: new Date().toISOString(),
      favicon: null, // Fallback
      totalTimeSpent: durationMs,
    })
  }

  const trimmedWebsites = websites.slice(0, 1000)
  await chrome.storage.local.set({ websites: trimmedWebsites })
}

// Handle tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const currentWindow = await chrome.windows.get(activeInfo.windowId)

  // Only track if the browser window is focused
  if (currentWindow.focused) {
    // If there was a previously active tab in a focused window, calculate its duration
    if (activeTabInfo && activeTabInfo.url && activeTabInfo.windowId === currentWindow.id) {
      const duration = Date.now() - activeTabInfo.startTime
      await updateWebsiteTime(activeTabInfo.url, duration)
    }

    // Set the new active tab
    const tab = await chrome.tabs.get(activeInfo.tabId)
    if (tab.url && !tab.url.startsWith("chrome://")) {
      activeTabInfo = {
        tabId: activeInfo.tabId,
        url: tab.url,
        startTime: Date.now(),
        windowId: activeInfo.windowId,
      }
    } else {
      activeTabInfo = null // Don't track chrome:// or invalid URLs
    }
    lastWindowFocusTime = Date.now() // Update window focus time
  } else {
    // If window is not focused, clear activeTabInfo to pause tracking
    if (activeTabInfo && activeTabInfo.windowId === currentWindow.id) {
      const duration = Date.now() - activeTabInfo.startTime
      await updateWebsiteTime(activeTabInfo.url, duration)
      activeTabInfo = null
    }
    lastWindowFocusTime = null
  }
})

// Handle tab removal
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (activeTabInfo && activeTabInfo.tabId === tabId) {
    const duration = Date.now() - activeTabInfo.startTime
    await updateWebsiteTime(activeTabInfo.url, duration)
    activeTabInfo = null // Clear active tab info
  }
})

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus (e.g., user switched to another app or minimized)
    if (activeTabInfo) {
      const duration = Date.now() - activeTabInfo.startTime
      await updateWebsiteTime(activeTabInfo.url, duration)
      activeTabInfo = null // Pause tracking
    }
    lastWindowFocusTime = null
  } else {
    // Browser gained focus
    lastWindowFocusTime = Date.now()
    // Find the currently active tab in the newly focused window
    const tabs = await chrome.tabs.query({ active: true, windowId: windowId })
    if (tabs.length > 0 && tabs[0].url && !tabs[0].url.startsWith("chrome://")) {
      activeTabInfo = {
        tabId: tabs[0].id,
        url: tabs[0].url,
        startTime: Date.now(),
        windowId: windowId,
      }
    } else {
      activeTabInfo = null
    }
  }
})

// Existing onUpdated listener (for initial visit and title/favicon updates)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && !tab.url.startsWith("chrome://")) {
    chrome.storage.local.get(["websites"], (result) => {
      const websites = result.websites || []

      const existingIndex = websites.findIndex((item) => item.url === tab.url)
      if (existingIndex !== -1) {
        // Update existing entry's timestamp, title, favicon, and move to front
        const existingWebsite = websites[existingIndex]
        existingWebsite.timestamp = new Date().toISOString() // Update last visited time
        existingWebsite.title = tab.title || "Unknown Title" // Update title in case it changed
        existingWebsite.favicon = tab.favIconUrl || null // Update favicon
        websites.splice(existingIndex, 1) // Remove old entry
        websites.unshift(existingWebsite) // Add updated entry to front
      } else {
        // Add new visit data with initialized totalTimeSpent
        const newVisitData = {
          id: Date.now().toString(),
          url: tab.url,
          title: tab.title || "Unknown Title",
          timestamp: new Date().toISOString(),
          favicon: tab.favIconUrl || null,
          totalTimeSpent: 0, // Initialize time spent for new entries
        }
        websites.unshift(newVisitData)
      }

      const trimmedWebsites = websites.slice(0, 1000)
      chrome.storage.local.set({ websites: trimmedWebsites })
    })
  }
})

// Existing onMessage listener for clipboard
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CLIPBOARD_CAPTURED") {
    const clipboardData = {
      id: Date.now().toString(),
      content: message.content,
      timestamp: new Date().toISOString(),
      sourceUrl: sender.tab?.url || null,
      sourceTitle: sender.tab?.title || null,
    }

    chrome.storage.local.get(["clipboard"], (result) => {
      const clipboard = result.clipboard || []

      // Prevent saving consecutive duplicate clipboard entries
      if (clipboard.length > 0 && clipboard[0].content === clipboardData.content) {
        sendResponse({ success: false, message: "Duplicate content ignored" })
        return
      }

      clipboard.unshift(clipboardData)
      const trimmedClipboard = clipboard.slice(0, 1000)
      chrome.storage.local.set({ clipboard: trimmedClipboard })
    })

    sendResponse({ success: true })
  }
})
