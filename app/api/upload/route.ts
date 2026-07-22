import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { logger } from '@/lib/logger'

// Token endpoint for @vercel/blob/client's upload() — the browser calls this
// first to get a short-lived, scoped upload token, then uploads the file
// bytes straight to Blob storage without routing them through this server.
export async function POST(request: Request) {
  const authenticated = await isAuthenticated()
  if (!authenticated) return new NextResponse('Unauthorized', { status: 401 })

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        addRandomSuffix: true,
        maximumSizeInBytes: 10 * 1024 * 1024
      }),
      onUploadCompleted: async () => {
        // No DB write here — the caller (image-upload.tsx) attaches the
        // resulting URL to the product/billboard form, which is what persists it.
      }
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    logger.error('[UPLOAD_TOKEN]', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
