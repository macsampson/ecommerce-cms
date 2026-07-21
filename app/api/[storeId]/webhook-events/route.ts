import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'

export type ApiWebhookEvent = {
  id: string
  stripeEventId: string
  createdAt: string
}

export async function GET(req: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: 'single-user'
      }
    })

    if (!store) {
      return new NextResponse('Unauthorized to access this store', {
        status: 403
      })
    }

    const events = await prismadb.processedWebhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const formatted: ApiWebhookEvent[] = events.map((event) => ({
      id: event.id,
      stripeEventId: event.stripeEventId,
      createdAt: event.createdAt.toISOString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    logger.error('[WEBHOOK_EVENTS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
