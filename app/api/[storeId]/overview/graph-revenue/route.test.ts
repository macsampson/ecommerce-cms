import { GET } from './route'
import { getGraphRevenue } from '@/actions/get-graph-revenue'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

jest.mock('@/actions/get-graph-revenue', () => ({
  getGraphRevenue: jest.fn()
}))

const getGraphRevenueMock = getGraphRevenue as jest.Mock
const authMock = isAuthenticated as jest.Mock
const prismaMock = prismadb as any

function makeRequest(query: string) {
  return new Request(`http://localhost/x${query}`) as any
}

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/overview/graph-revenue', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('returns graph data for the given year', async () => {
    getGraphRevenueMock.mockResolvedValue([{ name: 'Jan', total: 100 }])

    const response = await GET(makeRequest('?year=2026'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([{ name: 'Jan', total: 100 }])
    expect(getGraphRevenueMock).toHaveBeenCalledWith('store-1', 2026)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await GET(makeRequest('?year=2026'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthenticated')
    expect(getGraphRevenueMock).not.toHaveBeenCalled()
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await GET(makeRequest('?year=2026'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Unauthorized to access this store')
    expect(getGraphRevenueMock).not.toHaveBeenCalled()
  })

  it('returns 400 when year is missing', async () => {
    const response = await GET(makeRequest(''), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when year is not a number', async () => {
    const response = await GET(makeRequest('?year=abc'), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 500 if fetching graph revenue throws', async () => {
    getGraphRevenueMock.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('?year=2026'), baseParams)
    expect(response.status).toBe(500)
  })
})
