import { GET, PATCH, DELETE } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', sizeId: 's1' }) }

function makeRequest(method: string, body?: any) {
  return new Request('http://localhost/x', {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('GET /api/[storeId]/sizes/[sizeId]', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns the size', async () => {
    prismaMock.size.findUnique.mockResolvedValue({ id: 's1' })

    const response = await GET(makeRequest('GET'), baseParams)
    const data = await response.json()
    expect(data).toEqual({ id: 's1' })
  })

  it('returns 500 on a database error', async () => {
    prismaMock.size.findUnique.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('GET'), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('PATCH /api/[storeId]/sizes/[sizeId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.size.updateMany.mockResolvedValue({ count: 1 })
  })

  it('updates the size', async () => {
    const response = await PATCH(makeRequest('PATCH', { name: 'Large', value: 'L' }), baseParams)
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(makeRequest('PATCH', { name: 'Large', value: 'L' }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const response = await PATCH(makeRequest('PATCH', { value: 'L' }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when value is missing', async () => {
    const response = await PATCH(makeRequest('PATCH', { name: 'Large' }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await PATCH(makeRequest('PATCH', { name: 'Large', value: 'L' }), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.size.updateMany.mockRejectedValue(new Error('db down'))

    const response = await PATCH(makeRequest('PATCH', { name: 'Large', value: 'L' }), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('DELETE /api/[storeId]/sizes/[sizeId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('deletes the size', async () => {
    prismaMock.size.deleteMany.mockResolvedValue({ count: 1 })

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
    prismaMock.size.deleteMany.mockRejectedValue(new Error('db down'))

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(500)
  })
})
