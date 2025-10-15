import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
// https://vite.dev/config/
export default defineConfig( ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendHost = env.VITE_BACKEND_HOST
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/v1": {
          target: backendHost,
          changeOrigin: true,
        },
        "/v1/auth": {
          target: backendHost,
          changeOrigin: true,
        },
      },
    },
  }
})