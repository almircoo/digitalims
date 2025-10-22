import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
// https://vite.dev/config/
export default defineConfig( {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/v1": {
        target: "https://pedidos-cibertec.up.railway.app", // http://localhost:8080/
        changeOrigin: true,
      },
      "/v1/auth": {
        target: "https://pedidos-cibertec.up.railway.app", // http://localhost:8080/
        changeOrigin: true,
      },
    },
  },
})