import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8006', // Use IPv4 instead of localhost to avoid IPv6 issues
        changeOrigin: true,
        rewrite: (path) => path, // Keep the /api prefix
        configure: (proxy, options) => {
          // Log proxy requests for debugging
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const targetUrl = `http://127.0.0.1:8006${req.url}`
            console.log(`🔄 [PROXY] ${req.method} ${req.url}`)
            console.log(`   → Target: ${targetUrl}`)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`✅ [PROXY] ${req.method} ${req.url} → Status: ${proxyRes.statusCode}`)
            if (proxyRes.statusCode >= 400) {
              console.error(`   ❌ Error response received from backend`)
            }
          })
          proxy.on('error', (err, req, res) => {
            console.error(`\n❌ [PROXY ERROR] Connection failed!`)
            console.error(`   Request: ${req.method} ${req.url}`)
            console.error(`   Target: http://127.0.0.1:8006${req.url}`)
            console.error(`   Error: ${err.message}`)
            console.error(`   Code: ${err.code}`)
            console.error(`\n💡 Possible causes:`)
            console.error(`   1. Backend server is NOT running on port 8006`)
            console.error(`   2. Backend is running on a different port`)
            console.error(`   3. Firewall blocking connection`)
            console.error(`\n🔍 Troubleshooting:`)
            console.error(`   - Check if backend is running: curl http://127.0.0.1:8006/api/resume/optimization/health`)
            console.error(`   - Or: curl http://localhost:8006/api/resume/optimization/health`)
            console.error(`   - Verify backend startup command`)
            console.error(`   - Check backend logs\n`)
          })
        }
      }
    },
    cors: true // Enable CORS for development
  }
})

