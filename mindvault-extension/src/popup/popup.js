document.addEventListener("DOMContentLoaded", () => {
  let clipboardData = []
  let websiteData = []
  let filteredClipboard = []
  let filteredWebsites = []

  // Declare chrome variable to fix lint error
  const chrome = window.chrome

  function loadData() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["clipboard", "websites"], (result) => {
        clipboardData = result.clipboard || []
        websiteData = result.websites || []
        filteredClipboard = [...clipboardData]
        filteredWebsites = [...websiteData]
        updateUI()
      })
    } else {
      updateUI()
    }
  }

  function updateUI() {
    updateCounts()
    renderClipboard()
    renderWebsites()
  }

  function updateCounts() {
    const clipboardCountEl = document.getElementById("clipboardCount")
    const websiteCountEl = document.getElementById("websiteCount")
    if (clipboardCountEl) clipboardCountEl.textContent = filteredClipboard.length
    if (websiteCountEl) websiteCountEl.textContent = filteredWebsites.length
  }

  function renderClipboard() {
    const container = document.getElementById("clipboard-list")
    if (!container) return

    if (filteredClipboard.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No clipboard data yet</p>
          <small>Copy some text to get started!</small>
        </div>
      `
      return
    }

    container.innerHTML = filteredClipboard
      .map(
        (item) => `
        <div class="item">
          <div class="item-content">
            <div class="item-text">${escapeHtml(truncateText(item.content, 80))}</div>
            ${item.sourceTitle ? `<div class="item-source">From: ${escapeHtml(item.sourceTitle)}</div>` : ""}
            <div class="item-timestamp">${new Date(item.timestamp).toLocaleString()}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
            <button class="action-btn" onclick="copyToClipboard('${escapeForJs(item.content)}')">📋</button>
          </div>
        </div>
      `,
      )
      .join("")
  }

  function renderWebsites() {
    const container = document.getElementById("websites-list")
    if (!container) return

    if (filteredWebsites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No websites tracked yet</p>
          <small>Browse some sites to get started!</small>
        </div>
      `
      return
    }

    container.innerHTML = filteredWebsites
      .map(
        (item) => `
        <div class="item">
          <div class="item-content">
            <div class="website-header">
              ${item.favicon ? `<img src="${item.favicon}" alt="" class="favicon" onerror="this.style.display='none'">` : ""}
              <div class="website-title">${escapeHtml(truncateText(item.title, 40))}</div>
            </div>
            <div class="website-url">${escapeHtml(truncateText(item.url, 50))}</div>
            <div class="item-timestamp">${new Date(item.timestamp).toLocaleString()}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
            <button class="action-btn" onclick="openWebsite('${escapeForJs(item.url)}')">🔗</button>
          </div>
        </div>
      `,
      )
      .join("")
  }

  function truncateText(text, maxLength) {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  function escapeForJs(text) {
    if (!text) return ""
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n")
  }

  window.copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  window.openWebsite = (url) => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: url })
    }
  }

  function filterData() {
    const searchInput = document.getElementById("searchInput")
    const dateFilter = document.getElementById("dateFilter")
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
    const dateFilterValue = dateFilter ? dateFilter.value : ""

    filteredClipboard = clipboardData.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        (item.content && item.content.toLowerCase().includes(searchTerm)) ||
        (item.sourceTitle && item.sourceTitle.toLowerCase().includes(searchTerm))
      const matchesDate =
        !dateFilterValue || new Date(item.timestamp).toDateString() === new Date(dateFilterValue).toDateString()
      return matchesSearch && matchesDate
    })

    filteredWebsites = websiteData.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.url && item.url.toLowerCase().includes(searchTerm))
      const matchesDate =
        !dateFilterValue || new Date(item.timestamp).toDateString() === new Date(dateFilterValue).toDateString()
      return matchesSearch && matchesDate
    })

    updateUI()
  }

  function downloadJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      clipboard: clipboardData,
      websites: websiteData,
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindvault-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function downloadTXT() {
    let content = "MINDVAULT EXPORT\n=================\n\n"
    content += `Exported: ${new Date().toLocaleString()}\n\n`

    if (clipboardData.length > 0) {
      content += "CLIPBOARD HISTORY\n-----------------\n"
      clipboardData.forEach((item, index) => {
        content += `${index + 1}. ${new Date(item.timestamp).toLocaleString()}\n`
        if (item.sourceTitle) content += `   Source: ${item.sourceTitle}\n`
        content += `   Content: ${item.content}\n\n`
      })
    }

    if (websiteData.length > 0) {
      content += "WEBSITE HISTORY\n---------------\n"
      websiteData.forEach((item, index) => {
        content += `${index + 1}. ${new Date(item.timestamp).toLocaleString()}\n`
        content += `   Title: ${item.title}\n`
        content += `   URL: ${item.url}\n\n`
      })
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindvault-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Event listeners
  const searchInput = document.getElementById("searchInput")
  const dateFilter = document.getElementById("dateFilter")
  if (searchInput) searchInput.addEventListener("input", filterData)
  if (dateFilter) dateFilter.addEventListener("change", filterData)

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active")
      })
      const targetTab = document.getElementById(`${tabName}-tab`)
      if (targetTab) targetTab.classList.add("active")
    })
  })

  // Clear functions
  const clearClipboard = document.getElementById("clearClipboard")
  const clearWebsites = document.getElementById("clearWebsites")
  const clearAll = document.getElementById("clearAll")

  if (clearClipboard) {
    clearClipboard.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ clipboard: [] }, () => {
          clipboardData = []
          filteredClipboard = []
          updateUI()
        })
      }
    })
  }

  if (clearWebsites) {
    clearWebsites.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ websites: [] }, () => {
          websiteData = []
          filteredWebsites = []
          updateUI()
        })
      }
    })
  }

  if (clearAll) {
    clearAll.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.clear(() => {
          clipboardData = []
          websiteData = []
          filteredClipboard = []
          filteredWebsites = []
          updateUI()
        })
      }
    })
  }

  // Download buttons
  const downloadJSONBtn = document.getElementById("downloadJSON")
  const downloadTXTBtn = document.getElementById("downloadTXT")
  if (downloadJSONBtn) downloadJSONBtn.addEventListener("click", downloadJSON)
  if (downloadTXTBtn) downloadTXTBtn.addEventListener("click", downloadTXT)

  // Initialize
  loadData()
})
