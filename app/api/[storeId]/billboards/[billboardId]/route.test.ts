import { GET, PATCH, DELETE } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', billboardId: 'b1' }) }

function makeRequest(method: string, body?: any) {
  return new Request('http://localhost/api/store-1/billboards/b1', {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('GET /api/[storeId]/billboards/[billboardId]', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns the billboard', async () => {
    prismaMock.billboard.findUnique.mockResolvedValue({ id: 'b1' })

    const response = await GET(makeRequest('GET'), baseParams)
    const data = await response.json()

    expect(data).toEqual({ id: 'b1' })
  })

  it('returns 500 on a database error', async () => {
    prismaMock.billboard.findUnique.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('GET'), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('PATCH /api/[storeId]/billboards/[billboardId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.$transaction.mockImplementation((ops: Promise<any>[]) => Promise.all(ops))
    prismaMock.billboard.updateMany.mockResolvedValue({ count: 1 })
  })

  it('updates the billboard', async () => {
    const response = await PATCH(makeRequest('PATCH', { imageUrl: 'https://x/1.png' }), baseParams)
    expect(response.status).toBe(200)
  })

  it('unsets other landing-page billboards when this one becomes the landing page', async () => {
    await PATCH(makeRequest('PATCH', { imageUrl: 'https://x/1.png', landingPage: true }), baseParams)

    expect(prismaMock.billboard.updateMany).toHaveBeenCalledWith({
      where: { landingPage: true },
      data: { landingPage: false }
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(makeRequest('PATCH', { imageUrl: 'https://x/1.png' }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when imageUrl is missing', async () => {
    const response = await PATCH(makeRequest('PATCH', {}), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await PATCH(makeRequest('PATCH', { imageUrl: 'https://x/1.png' }), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.$transaction.mockRejectedValue(new Error('db down'))

    const response = await PATCH(makeRequest('PATCH', { imageUrl: 'https://x/1.png' }), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('DELETE /api/[storeId]/billboards/[billboardId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('deletes the billboard', async () => {
    prismaMock.billboard.deleteMany.mockResolvedValue({ count: 1 })

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
    prismaMock.billboard.deleteMany.mockRejectedValue(new Error('db down'))

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(500)
  })
})
