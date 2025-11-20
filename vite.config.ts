import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  server: {
    port: 8080,
    hmr: {
      host: "localhost",
      clientPort: 8080
    },
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true
      }
    }
  }
});
