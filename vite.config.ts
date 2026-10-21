import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 存档存在 IndexedDB 里，按「协议 + 域名 + 端口」隔离。端口固定后存档才不会因端口变化而「丢失」。
export default defineConfig({
  plugins: [react()],
  // 剧本全部打包在主文件里，本地运行不需要拆分。
  build: { chunkSizeWarningLimit: 1000 },
  server: { port: 5730, strictPort: true },
  preview: { port: 5730, strictPort: true },
});
