import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'

export const config = { api: { bodyParser: false } }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const pathname = req.query.pathname as string
  if (!pathname) {
    return res.status(400).json({ error: 'pathname query param required' })
  }

  // Read raw body into a buffer
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }
  const buffer = Buffer.concat(chunks)

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: req.headers['content-type'] ?? 'application/octet-stream',
    // BLOB_READ_WRITE_TOKEN picked up automatically from env
  })

  return res.status(200).json({ url: blob.url })
}
