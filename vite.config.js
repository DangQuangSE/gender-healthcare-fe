import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { BASE_URL } from "./src/shared/config/env";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    proxy: {
      "/api": {
        target: BASE_URL, // địa chỉ Spring Boot backend từ config chung
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
