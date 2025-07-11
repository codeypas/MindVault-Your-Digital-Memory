const chrome = globalThis.chrome

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && !tab.url.startsWith("chrome://")) {
    const visitData = {
      id: Date.now().toString(),
      url: tab.url,
      title: tab.title || "Unknown Title",
      timestamp: new Date().toISOString(),
      favicon: tab.favIconUrl || null,
    }

    chrome.storage.local.get(["websites"], (result) => {
      const websites = result.websites || []
      websites.unshift(visitData)
      const trimmedWebsites = websites.slice(0, 100)
      chrome.storage.local.set({ websites: trimmedWebsites })
    })
  }
})

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
      clipboard.unshift(clipboardData)
      const trimmedClipboard = clipboard.slice(0, 50)
      chrome.storage.local.set({ clipboard: trimmedClipboard })
    })

    sendResponse({ success: true })
  }
})
