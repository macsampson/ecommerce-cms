import { POST, GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

function makeRequest(body: any) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/[storeId]/categories', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('creates a category', async () => {
    prismaMock.category.create.mockResolvedValue({ id: 'c1', name: 'Shirts' })

    const response = await POST(makeRequest({ name: 'Shirts', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest({ name: 'Shirts', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const response = await POST(makeRequest({ billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when billboardId is missing', async () => {
    const response = await POST(makeRequest({ name: 'Shirts' }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest({ name: 'Shirts', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.category.create.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest({ name: 'Shirts', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('GET /api/[storeId]/categories', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns categories for the store', async () => {
    prismaMock.category.findMany.mockResolvedValue([{ id: 'c1' }])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toEqual([{ id: 'c1' }])
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(new Request('http://localhost/x'), { params: Promise.resolve({ storeId: '' }) })
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.category.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
