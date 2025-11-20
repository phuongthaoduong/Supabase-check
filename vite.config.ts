import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "SUPABASE_", "API_"],
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
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 8080
  }
});
