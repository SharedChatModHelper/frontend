import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const baseUrl = process.env.CF_PAGES_URL || (mode === "development" ? "http://localhost:3000" : "https://sharedmodhelper.live");

  return {
    plugins: [
      TanStackRouterVite(),
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.BASE_URL': JSON.stringify(baseUrl)
    }
  }
})
