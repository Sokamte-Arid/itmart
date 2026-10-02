import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The backend the dev server forwards API calls to. Keep it on localhost:
// the phone never talks to it directly — it talks to this dev server, which
// forwards /api and /uploads. That's what lets the admin work on a phone
// (same Wi-Fi, USB, or an ngrok/Cloudflare tunnel) during development.
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000'

const forward = {
  target: BACKEND,
  changeOrigin: true,
  // The request now comes from this dev server, not from the browser, so drop
  // the browser's Origin header — otherwise the backend's CORS check would
  // reject phones opening the admin via an IP address or a tunnel URL.
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true, // also reachable from other devices on your Wi-Fi (http://<your-PC-IP>:5174)
    allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok.io', '.trycloudflare.com'],
    proxy: { '/api': forward, '/uploads': forward },
  },
  preview: {
    port: 4174,
    host: true,
    allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok.io', '.trycloudflare.com'],
    proxy: { '/api': forward, '/uploads': forward },
  },
})
