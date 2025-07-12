;(() => {
  let lastClipboardContent = ""
  const chrome = window.chrome

  // Function to check if content is likely structured or formatted (HTML, CSS, JSON, etc.)
  function isStructuredOrFormattedContent(text) {
    const trimmedText = text.trim()
    if (trimmedText.length === 0) return false

    // 1. Check for common HTML patterns
    const htmlPatterns = [
      /^<!DOCTYPE html>/i,
      /<html[\s>]/i,
      /<head[\s>]/i,
      /<body[\s>]/i,
      /<div[\s>]/i,
      /<span[\s>]/i,
      /<p[\s>]/i,
      /<a\s+href=/i,
      /<img\s+src=/i,
      /<script[\s>]/i,
      /<style[\s>]/i,
      /<\/[a-z][^>]*>/i, // Closing tags
      /&lt;!--/i, // HTML comments in escaped form
    ]
    for (const pattern of htmlPatterns) {
      if (pattern.test(trimmedText)) return true
    }

    // 2. Check for common CSS patterns
    // Look for curly braces, semicolons, and colons, which are highly indicative of CSS
    const cssIndicators = (trimmedText.match(/[{};:]/g) || []).length
    const nonWhitespaceLength = trimmedText.replace(/\s/g, "").length

    // If there's a high density of CSS-like characters in a reasonably long string
    if (nonWhitespaceLength > 20 && cssIndicators / nonWhitespaceLength > 0.08) {
      return true
    }
    // Also check for common CSS properties if they appear without being part of a natural language sentence
    if (/(font-family|color|background|margin|padding|border|px|em|rem|vh|vw)\s*:/i.test(trimmedText)) {
      return true
    }

    // 3. Check for common JSON/JavaScript patterns
    if (
      (trimmedText.startsWith("{") && trimmedText.endsWith("}")) ||
      (trimmedText.startsWith("[") && trimmedText.endsWith("]")) ||
      /["']\s*:\s*["']/i.test(trimmedText) || // key: "value"
      /(function|const|let|var|class)\s+\w+\s*$$.*$$\s*{/i.test(trimmedText) // JS function/class declaration
    ) {
      return true
    }

    // 4. Heuristic for general structured content (e.g., code, XML, etc.)
    // If it contains a mix of angle brackets, curly braces, square brackets, and quotes
    const structuredIndicators = (trimmedText.match(/[<>{}[\]"']/g) || []).length
    if (nonWhitespaceLength > 30 && structuredIndicators / nonWhitespaceLength > 0.05) {
      return true
    }

    return false
  }

  async function checkClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText()

        // Only process if content is not empty, different from last, and NOT likely structured/formatted content
        if (
          clipboardText &&
          clipboardText !== lastClipboardContent &&
          clipboardText.trim().length > 0 &&
          !isStructuredOrFormattedContent(clipboardText.trim())
        ) {
          lastClipboardContent = clipboardText

          chrome.runtime.sendMessage({
            type: "CLIPBOARD_CAPTURED",
            content: clipboardText.trim(),
          })
        }
      }
    } catch (error) {
      console.log("Clipboard access denied or failed to read:", error)
    }
  }

  document.addEventListener("copy", () => {
    setTimeout(checkClipboard, 100)
  })

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "c") {
      setTimeout(checkClipboard, 100)
    }
  })

  let clipboardInterval

  function startClipboardMonitoring() {
    // Clear any existing interval to prevent duplicates
    stopClipboardMonitoring()
    clipboardInterval = setInterval(checkClipboard, 2000)
  }

  function stopClipboardMonitoring() {
    if (clipboardInterval) {
      clearInterval(clipboardInterval)
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startClipboardMonitoring()
    } else {
      stopClipboardMonitoring()
    }
  })

  // Initial start if page is visible
  if (document.visibilityState === "visible") {
    startClipboardMonitoring()
  }
})()
