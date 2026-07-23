import { getRecentWebhookEvents } from './get-recent-webhook-events'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

describe('getRecentWebhookEvents', () => {
  beforeEach(() => jest.resetAllMocks())

  it('formats events with createdAt as an ISO string, defaulting to a limit of 5', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    prismaMock.processedWebhookEvent.findMany.mockResolvedValue([
      { id: 'e1', stripeEventId: 'evt_1', createdAt }
    ])

    const result = await getRecentWebhookEvents()

    expect(result).toEqual([{ id: 'e1', stripeEventId: 'evt_1', createdAt: createdAt.toISOString() }])
    expect(prismaMock.processedWebhookEvent.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  })

  it('respects a custom limit', async () => {
    prismaMock.processedWebhookEvent.findMany.mockResolvedValue([])

    await getRecentWebhookEvents(20)

    expect(prismaMock.processedWebhookEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    )
  })

  it('returns an empty array when there are no events', async () => {
    prismaMock.processedWebhookEvent.findMany.mockResolvedValue([])

    const result = await getRecentWebhookEvents()

    expect(result).toEqual([])
  })
})
