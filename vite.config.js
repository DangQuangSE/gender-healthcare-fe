import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { BASE_URL } from "./src/shared/config/env";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, globalThis["process"].cwd(), "");
  const runtimeEnv = globalThis["process"]?.env ?? {};
  const configuredApiUrl = runtimeEnv.VITE_API_BASE_URL || env.VITE_API_BASE_URL;
  const configuredBaseUrl = runtimeEnv.VITE_BASE_URL || env.VITE_BASE_URL;
  const proxyTarget =
    runtimeEnv.VITE_DEV_PROXY_TARGET ||
    configuredBaseUrl ||
    configuredApiUrl?.replace(/\/api\/?$/, "") ||
    BASE_URL;

  return {
    plugins: [react()],
    define: {
      global: "globalThis",
    },
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/ws": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
