/// <reference types="vitest" />

import path from "path";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "public", // public ディレクトリを指定
  build: {
    outDir: "dist", // 出力ディレクトリを指定
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"), // ポップアップのエントリーポイント
        options: path.resolve(__dirname, "options.html"),
        background: path.resolve(__dirname, "src/background.ts"), // background.tsを追加
        offscreen: path.resolve(__dirname, "src/offscreen.ts"), // offscreen.tsを追加
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
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
});
