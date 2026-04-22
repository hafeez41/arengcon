import type { VercelRequest, VercelResponse } from '@vercel/node'
import { del } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { urls } = req.body as { urls: string[] }

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'urls must be a non-empty array' })
  }

  // BLOB_READ_WRITE_TOKEN is picked up automatically from env on the server
  await del(urls)

  return res.status(200).json({ ok: true })
}
