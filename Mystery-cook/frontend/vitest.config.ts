import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        // ブラウザ環境をシミュレート（DOMの操作が必要なため）
        environment: "jsdom",
        // 各テストファイルで import しなくても jest-dom のマッチャーが使えるようにする
        setupFiles: ["./vitest.setup.ts"],
        globals: true,
    },
});