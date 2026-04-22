import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'

export const config = { api: { bodyParser: false } }

function readBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const pathname = req.query.pathname as string
  if (!pathname) {
    return res.status(400).json({ error: 'pathname query param required' })
  }

  try {
    const buffer = await readBody(req)
    const contentType = (req.headers['content-type'] ?? 'application/octet-stream').split(';')[0].trim()

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return res.status(200).json({ url: blob.url })
  } catch (err: any) {
    console.error('[upload-blob]', err)
    return res.status(500).json({ error: err?.message ?? String(err) })
  }
}
