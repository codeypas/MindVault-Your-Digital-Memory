# 🧠 MindVault - Your Digital Memory

**MindVault** is a powerful Chrome extension that automatically captures clipboard content and tracks the websites you visit — acting as your digital memory assistant.

---

## Features

- Automatically logs clipboard content.
- Tracks websites you visit in real-time.
- Filter by keyword or date.
- Export data as `.txt`.
- Clear clipboard/web history with one click.

---

## 🖼️ Screenshots

### 📋 Clipboard Tab
<img src="https://github.com/codeypas/MindVault-Your-Digital-Memory/raw/main/mindvault-extension/ScreenShots/clipboard.png" width="40%" alt="Clipboard Tab" />

### 🌐 Website Tracking (Sites Tab)
<img src="https://github.com/codeypas/MindVault-Your-Digital-Memory/blob/main/mindvault-extension/ScreenShots/sites.png" width="40%" alt="Sites Tab" />

### 🔍 Search & Filter Feature
<img src="https://github.com/codeypas/MindVault-Your-Digital-Memory/blob/main/mindvault-extension/ScreenShots/search.png" width="40%" alt="Search Feature" />

---

## How to Install & Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/codeypas/mindvault-extension.git
cd mindvault-extension
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run build
```

This creates a production-ready build inside the `dist/` directory.

### 4. Load in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load Unpacked**
4. Select the `dist/` folder

---

## 📁 Project Structure

```
mindvault-extension/
├── manifest.json              # Chrome extension manifest
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── src/
│   ├── background.js          # Service worker for website tracking
│   ├── content.js             # Content script for clipboard detection
│   └── popup/
│       ├── popup.html         # Popup HTML
│       ├── popup.jsx          # React entry point
│       ├── App.jsx            # Main React component
│       └── popup.css          # Popup styles
├── icons/                     # Extension icons (16x, 48x, 128x)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── dist/                      # Built files (auto-generated)
```

---

## 📦 Tech Stack

- ⚛️ **React**
- ⚡ **Vite**
- 🧠 **Chrome Extension Manifest V3**
- 💡 **JavaScript (ES Modules)**

---

## 🛡️ Permissions Used

- `storage`: For saving data in browser.
- `tabs`: To get tab data (title and favicon).
- `activeTab`: To interact with the active tab.
- `<all_urls>`: So content script can access all pages.

---

## 🧪 Development Notes

- Use `npm run dev` to rebuild on changes
- Use `chrome://extensions/` → “Reload” to refresh the unpacked extension
- All user data is stored locally using `chrome.storage.local`

---

## 🤝 Contributing

Pull requests and suggestions are welcome!  
Feel free to open issues for improvements, bugs, or features.

---

## 📫 Contact

Got feedback or want to connect?

📌 [GitHub Profile](https://github.com/codeypas)  
📧 Contact: bjbestintheworld@gmail.com  
