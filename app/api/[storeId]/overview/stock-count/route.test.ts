import { GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/overview/stock-count', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('returns the count of in-stock, non-archived products', async () => {
    prismaMock.product.count.mockResolvedValue(12)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toEqual({ stockCount: 12 })
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { storeId: 'store-1', isArchived: false, quantity: { gt: 0 } }
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
    prismaMock.product.count.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
