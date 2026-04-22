import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req as any,
      onBeforeGenerateToken: async (_pathname) => ({
        allowedContentTypes: [
          'image/jpeg', 'image/jpg', 'image/png',
          'image/webp', 'image/gif', 'image/avif',
        ],
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('[upload-blob] completed:', blob.url)
      },
    })
    return res.status(200).json(jsonResponse)
  } catch (err: any) {
    console.error('[upload-blob]', err)
    return res.status(400).json({ error: err?.message ?? String(err) })
  }
}
