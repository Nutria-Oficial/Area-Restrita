import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api/chatbot/": {
        target: "https://nutria-fast-api.koyeb.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/chatbot\//, "/chatbot/"),
      },
    },
  },
});
