import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

/** Dev-only middleware that mirrors the /api/delete-blob serverless function */
function devApiPlugin(blobToken: string): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      // Upload handler
      server.middlewares.use('/api/upload-blob', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method not allowed'); return
        }
        const qs = new URL(req.url!, 'http://localhost').searchParams
        const pathname = qs.get('pathname') ?? ''
        const contentType = (req.headers['content-type'] as string) ?? 'application/octet-stream'
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks)
            const { put } = await import('@vercel/blob')
            const blob = await put(pathname, buffer, { access: 'public', token: blobToken, contentType })
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ url: blob.url }))
          } catch (err) {
            console.error('[dev-api] upload-blob failed:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })

      // Delete handler
      server.middlewares.use('/api/delete-blob', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const { urls } = JSON.parse(body) as { urls: string[] }
            const { del } = await import('@vercel/blob')
            await del(urls, { token: blobToken })
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            console.error('[dev-api] delete-blob failed:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_-prefixed) so the middleware token is available
  const env = loadEnv(mode, process.cwd(), '')
  const blobToken = env.BLOB_READ_WRITE_TOKEN ?? ''

  return {
    plugins: [
      react(),
      tailwindcss(),
      devApiPlugin(blobToken),
    ],
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  }
})
