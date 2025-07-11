;(() => {
  let lastClipboardContent = ""
  const chrome = window.chrome // Declare the chrome variable

  async function checkClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText()

        if (clipboardText && clipboardText !== lastClipboardContent && clipboardText.trim().length > 0) {
          lastClipboardContent = clipboardText

          chrome.runtime.sendMessage({
            type: "CLIPBOARD_CAPTURED",
            content: clipboardText.trim(),
          })
        }
      }
    } catch (error) {
      console.log("Clipboard access denied")
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

  if (document.visibilityState === "visible") {
    startClipboardMonitoring()
  }
})()
