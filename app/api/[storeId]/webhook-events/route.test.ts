import { GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/webhook-events', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('formats webhook events with createdAt as an ISO string', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    prismaMock.processedWebhookEvent.findMany.mockResolvedValue([
      { id: 'e1', stripeEventId: 'evt_1', createdAt }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toEqual([{ id: 'e1', stripeEventId: 'evt_1', createdAt: createdAt.toISOString() }])
    expect(prismaMock.processedWebhookEvent.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(new Request('http://localhost/x'), { params: Promise.resolve({ storeId: '' }) })
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.processedWebhookEvent.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
