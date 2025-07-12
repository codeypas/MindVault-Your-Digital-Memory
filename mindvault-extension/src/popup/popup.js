document.addEventListener("DOMContentLoaded", () => {
  let clipboardData = []
  let websiteData = []
  let filteredClipboard = []
  let filteredWebsites = []

  let isClipboardSelectMode = false
  let isWebsiteSelectMode = false
  let selectedClipboardIds = []
  let selectedWebsiteIds = []

  const chrome = window.chrome

  function loadData() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["clipboard", "websites"], (result) => {
        clipboardData = result.clipboard || []
        websiteData = result.websites || []
        filterData() // Apply filter after loading data
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
        <div class="item" data-id="${item.id}">
          ${isClipboardSelectMode ? `<input type="checkbox" class="item-checkbox" data-id="${item.id}" ${selectedClipboardIds.includes(item.id) ? "checked" : ""}>` : ""}
          <div class="item-content">
            <div class="item-text">${escapeHtml(truncateText(item.content, 100))}</div>
            ${item.sourceTitle ? `<div class="item-source">From: ${escapeHtml(item.sourceTitle)}</div>` : ""}
            <div class="item-timestamp">${new Date(item.timestamp).toLocaleString()}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
            <button class="action-btn" data-content="${escapeHtml(item.content)}" data-original-icon="${isURL(item.content) ? "🔗" : "📋"}">
              ${isURL(item.content) ? "🔗" : "📋"}
            </button>
            <button class="delete-btn" data-id="${item.id}">🗑️</button>
          </div>
        </div>
      `,
      )
      .join("")

    // Attach event listeners after rendering
    container.querySelectorAll(".action-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const content = event.currentTarget.dataset.content
        window.handleClipboardAction(content, event.currentTarget) // Pass the button element
      })
    })

    container.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = event.currentTarget.dataset.id
        deleteSingleItem("clipboard", id)
      })
    })

    if (isClipboardSelectMode) {
      container.querySelectorAll(".item-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
          const id = event.currentTarget.dataset.id
          handleSelectionChange("clipboard", id, event.currentTarget.checked)
        })
      })
    }
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
        <div class="item" data-id="${item.id}">
          ${isWebsiteSelectMode ? `<input type="checkbox" class="item-checkbox" data-id="${item.id}" ${selectedWebsiteIds.includes(item.id) ? "checked" : ""}>` : ""}
          <div class="item-content">
            <div class="website-header">
              ${item.favicon ? `<img src="${item.favicon}" alt="" class="favicon" onerror="this.style.display='none'">` : ""}
              <div class="website-title">${escapeHtml(truncateText(item.title, 50))}</div>
            </div>
            <div class="website-url">${escapeHtml(truncateText(item.url, 70))}</div>
            <div class="item-timestamp">Last Visited: ${new Date(item.timestamp).toLocaleString()}</div>
            <div class="item-time-spent">Time Spent: ${formatDuration(item.totalTimeSpent || 0)}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
            <button class="action-btn" data-url="${escapeHtml(item.url)}">🔗</button>
            <button class="delete-btn" data-id="${item.id}">🗑️</button>
          </div>
        </div>
      `,
      )
      .join("")

    // Attach event listeners after rendering
    container.querySelectorAll(".action-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const url = event.currentTarget.dataset.url
        window.openWebsite(url)
      })
    })

    container.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = event.currentTarget.dataset.id
        deleteSingleItem("websites", id)
      })
    })

    if (isWebsiteSelectMode) {
      container.querySelectorAll(".item-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
          const id = event.currentTarget.dataset.id
          handleSelectionChange("websites", id, event.currentTarget.checked)
        })
      })
    }
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

  function formatDuration(ms) {
    if (ms === undefined || ms === null || isNaN(ms)) return "0s"
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours % 24 > 0) parts.push(`${hours % 24}h`)
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`)
    if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`) // Ensure at least seconds are shown

    return parts.join(" ")
  }

  function escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // Helper to check if content is a URL
  function isURL(text) {
    try {
      new URL(text)
      return true
    } catch (e) {
      return false
    }
  }

  window.handleClipboardAction = async (content, buttonElement) => {
    if (isURL(content)) {
      window.openWebsite(content) // Open the URL
    } else {
      try {
        await navigator.clipboard.writeText(content) // Copy the text

        // Provide visual feedback
        if (buttonElement) {
          const originalIcon = buttonElement.dataset.originalIcon || "📋" // Get original icon from data attribute
          buttonElement.textContent = "✅" // Change to checkmark
          buttonElement.style.pointerEvents = "none" // Disable clicks during feedback

          setTimeout(() => {
            buttonElement.textContent = originalIcon // Revert to original icon
            buttonElement.style.pointerEvents = "auto" // Re-enable clicks
          }, 1500) // Show feedback for 1.5 seconds
        }
      } catch (error) {
        console.error("Failed to copy:", error)
      }
    }
  }

  window.openWebsite = (url) => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      // Ensure URL has a protocol for chrome.tabs.create
      const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
      chrome.tabs.create({ url: fullUrl })
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

  function downloadReport() {
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MindVault Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
          h1 { color: #4A90E2; text-align: center; margin-bottom: 20px; }
          h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
          .section { margin-bottom: 30px; }
          .item { background: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .item p { margin: 0 0 8px 0; }
          .item strong { color: #555; display: inline-block; min-width: 120px; }
          .item .timestamp, .item .source, .item .time-spent { font-size: 0.9em; color: #777; }
          .url-link { color: #007bff; text-decoration: none; word-break: break-all; }
          .url-link:hover { text-decoration: underline; }
          @media print {
            body { margin: 0; padding: 20px; }
            .item { page-break-inside: avoid; margin-bottom: 15px; }
            h1, h2 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>MindVault Data Report</h1>
        <p style="text-align: center; font-size: 0.9em; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
    `

    if (clipboardData.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>Clipboard History</h2>
      `
      clipboardData.forEach((item) => {
        htmlContent += `
          <div class="item">
            <p><strong>Content Copied:</strong> ${escapeHtml(item.content)}</p>
            <p class="timestamp"><strong>Date & Time:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
            ${item.sourceTitle ? `<p class="source"><strong>Source:</strong> ${escapeHtml(item.sourceTitle)}</p>` : ""}
          </div>
        `
      })
      htmlContent += `</div>`
    }

    if (websiteData.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>Website History</h2>
      `
      websiteData.forEach((item) => {
        htmlContent += `
          <div class="item">
            <p><strong>Title:</strong> ${escapeHtml(item.title)}</p>
            <p><strong>URL Link:</strong> <a href="${escapeHtml(item.url)}" class="url-link" target="_blank" rel="noopener noreferrer">${escapeHtml(item.url)}</a></p>
            <p class="timestamp"><strong>Date & Time Visited:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
            <p class="time-spent"><strong>Time Spent:</strong> ${formatDuration(item.totalTimeSpent || 0)}</p>
          </div>
        `
      })
      htmlContent += `</div>`
    }

    htmlContent += `
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindvault-report-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert(
      "Report downloaded as HTML. Open the file in your browser and use the browser's print function (Ctrl+P or Cmd+P) to save it as a PDF.\n\n" +
        "Steps to save as PDF:\n" +
        "1. Open the downloaded HTML file in your web browser.\n" +
        "2. Press Ctrl+P (Windows/Linux) or Cmd+P (macOS) to open the print dialog.\n" +
        "3. In the print dialog, select 'Save as PDF' or 'Microsoft Print to PDF' (or similar) as your printer destination.\n" +
        "4. Click 'Save' to save the report as a PDF file.",
    )
  }

  // --- Select Mode Functions ---
  function toggleSelectMode(type) {
    if (type === "clipboard") {
      isClipboardSelectMode = !isClipboardSelectMode
      selectedClipboardIds = [] // Clear selection when toggling mode
      document.getElementById("clipboard-select-btn").textContent = isClipboardSelectMode ? "Done" : "Select"
      document.getElementById("clipboard-delete-selected-btn").classList.toggle("hidden", !isClipboardSelectMode)
    } else if (type === "websites") {
      isWebsiteSelectMode = !isWebsiteSelectMode
      selectedWebsiteIds = [] // Clear selection when toggling mode
      document.getElementById("websites-select-btn").textContent = isWebsiteSelectMode ? "Done" : "Select"
      document.getElementById("websites-delete-selected-btn").classList.toggle("hidden", !isWebsiteSelectMode)
    }
    updateUI() // Re-render to show/hide checkboxes
  }

  function handleSelectionChange(type, id, isChecked) {
    if (type === "clipboard") {
      if (isChecked) {
        selectedClipboardIds.push(id)
      } else {
        selectedClipboardIds = selectedClipboardIds.filter((itemId) => itemId !== id)
      }
    } else if (type === "websites") {
      if (isChecked) {
        selectedWebsiteIds.push(id)
      } else {
        selectedWebsiteIds = selectedWebsiteIds.filter((itemId) => itemId !== id)
      }
    }
    // No need to updateUI here, checkbox state is managed by browser
  }

  async function deleteSingleItem(type, idToDelete) {
    if (
      !confirm(`Are you sure you want to delete this ${type === "clipboard" ? "clipboard entry" : "website entry"}?`)
    ) {
      return
    }

    if (type === "clipboard") {
      clipboardData = clipboardData.filter((item) => item.id !== idToDelete)
      await chrome.storage.local.set({ clipboard: clipboardData })
    } else if (type === "websites") {
      websiteData = websiteData.filter((item) => item.id !== idToDelete)
      await chrome.storage.local.set({ websites: websiteData })
    }
    filterData() // Re-filter and re-render
  }

  async function deleteSelectedItems(type) {
    let idsToDelete
    let dataArray
    let storageKey

    if (type === "clipboard") {
      idsToDelete = selectedClipboardIds
      dataArray = clipboardData
      storageKey = "clipboard"
    } else if (type === "websites") {
      idsToDelete = selectedWebsiteIds
      dataArray = websiteData
      storageKey = "websites"
    }

    if (idsToDelete.length === 0) {
      alert("No items selected for deletion.")
      return
    }

    if (
      !confirm(
        `Are you sure you want to delete ${idsToDelete.length} selected ${type} entries? This action cannot be undone.`,
      )
    ) {
      return
    }

    const newData = dataArray.filter((item) => !idsToDelete.includes(item.id))
    if (type === "clipboard") {
      clipboardData = newData
      selectedClipboardIds = [] // Clear selection
      isClipboardSelectMode = false // Exit select mode
      document.getElementById("clipboard-select-btn").textContent = "Select"
      document.getElementById("clipboard-delete-selected-btn").classList.add("hidden")
    } else if (type === "websites") {
      websiteData = newData
      selectedWebsiteIds = [] // Clear selection
      isWebsiteSelectMode = false // Exit select mode
      document.getElementById("websites-select-btn").textContent = "Select"
      document.getElementById("websites-delete-selected-btn").classList.add("hidden")
    }

    await chrome.storage.local.set({ [storageKey]: newData })
    filterData() // Re-filter and re-render
  }
  // --- End Select Mode Functions ---

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
      if (confirm("Are you sure you want to clear all clipboard history? This action cannot be undone.")) {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({ clipboard: [] }, () => {
            clipboardData = []
            filteredClipboard = []
            updateUI()
          })
        }
      }
    })
  }

  if (clearWebsites) {
    clearWebsites.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all website history? This action cannot be undone.")) {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({ websites: [] }, () => {
            websiteData = []
            filteredWebsites = []
            updateUI()
          })
        }
      }
    })
  }

  if (clearAll) {
    clearAll.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to clear ALL MindVault history (clipboard and websites)? This action cannot be undone.",
        )
      ) {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.clear(() => {
            clipboardData = []
            websiteData = []
            filteredClipboard = []
            filteredWebsites = []
            updateUI()
          })
        }
      }
    })
  }

  // Download buttons
  const downloadReportBtn = document.getElementById("downloadReport")
  if (downloadReportBtn) downloadReportBtn.addEventListener("click", downloadReport)

  // Select/Delete Selected buttons
  document.getElementById("clipboard-select-btn").addEventListener("click", () => toggleSelectMode("clipboard"))
  document
    .getElementById("clipboard-delete-selected-btn")
    .addEventListener("click", () => deleteSelectedItems("clipboard"))
  document.getElementById("websites-select-btn").addEventListener("click", () => toggleSelectMode("websites"))
  document
    .getElementById("websites-delete-selected-btn")
    .addEventListener("click", () => deleteSelectedItems("websites"))

  // Initialize
  loadData()
})
