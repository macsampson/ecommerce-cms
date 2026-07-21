import prismadb from '@/lib/prismadb'

export type WebhookEventEntry = {
  id: string
  stripeEventId: string
  createdAt: string
}

export const getRecentWebhookEvents = async (
  limit: number = 5
): Promise<WebhookEventEntry[]> => {
  const events = await prismadb.processedWebhookEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return events.map((event) => ({
    id: event.id,
    stripeEventId: event.stripeEventId,
    createdAt: event.createdAt.toISOString()
  }))
}
