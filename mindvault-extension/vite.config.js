import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.js"),
        content: resolve(__dirname, "src/content.js"),
        popup: resolve(__dirname, "src/popup/popup.js"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".png")) {
            return "icons/[name][extname]"
          }
          return "[name][extname]"
        },
      },
    },
  },
  publicDir: "src/public",
})
