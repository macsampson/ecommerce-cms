import { GET, PATCH, DELETE } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', categoryId: 'c1' }) }

function makeRequest(method: string, body?: any) {
  return new Request('http://localhost/x', {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('GET /api/[storeId]/categories/[categoryId]', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns the category with its billboard', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 'c1' })

    const response = await GET(makeRequest('GET'), baseParams)
    const data = await response.json()

    expect(data).toEqual({ id: 'c1' })
    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'c1' },
      include: { billboard: true }
    })
  })

  it('returns 500 on a database error', async () => {
    prismaMock.category.findUnique.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('GET'), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('PATCH /api/[storeId]/categories/[categoryId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.category.updateMany.mockResolvedValue({ count: 1 })
  })

  it('updates the category', async () => {
    const response = await PATCH(makeRequest('PATCH', { name: 'New', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(makeRequest('PATCH', { name: 'New', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const response = await PATCH(makeRequest('PATCH', { billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await PATCH(makeRequest('PATCH', { name: 'New', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.category.updateMany.mockRejectedValue(new Error('db down'))

    const response = await PATCH(makeRequest('PATCH', { name: 'New', billboardId: 'b1' }), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('DELETE /api/[storeId]/categories/[categoryId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('deletes the category', async () => {
    prismaMock.category.deleteMany.mockResolvedValue({ count: 1 })

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.category.deleteMany.mockRejectedValue(new Error('db down'))

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(500)
  })
})
