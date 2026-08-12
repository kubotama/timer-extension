/// <reference types="vitest" />

import path from "path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist",
    modulePreload: false, // modulepreload <link> タグの自動挿入を無効化
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        background: path.resolve(__dirname, "src/background.ts"),
        offscreen: path.resolve(__dirname, "src/offscreen.ts"),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        // 共通モジュールを単一共有ファイルに切り出さずインライン化する
        manualChunks: () => undefined,
      },
    },
  },
  test: {
    // テストに関するAPIをグローバルに設定
    globals: true,
    // テスト環境の設定
    environment: "jsdom",
    // テストの設定ファイル
    setupFiles: ["./vitest-setup.ts"],
    // CSSファイルを処理する
    css: true,
    // テストのカバレッジを出力する設定
    coverage: {
      // @vitest/coverage-v8を設定
      provider: "v8",
    },
  },
})
