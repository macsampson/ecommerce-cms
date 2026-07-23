import { GET, POST, PATCH } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

function makeRequest(method: string, body?: any) {
  return new Request('http://localhost/api/store-1/billboards/carousel', {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('GET /api/[storeId]/billboards/carousel', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns carousel images for the store', async () => {
    prismaMock.carouselImage.findMany.mockResolvedValue([{ id: 'c1' }])

    const response = await GET(makeRequest('GET'), baseParams)
    const data = await response.json()

    expect(data).toEqual([{ id: 'c1' }])
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(makeRequest('GET'), { params: Promise.resolve({ storeId: '' }) })
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.carouselImage.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('GET'), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('POST /api/[storeId]/billboards/carousel', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.carouselImage.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.carouselImage.createMany.mockResolvedValue({ count: 1 })
  })

  it('replaces the carousel images for the store', async () => {
    const response = await POST(
      makeRequest('POST', { images: [{ imageUrl: 'https://x/1.png', imageCredit: 'me' }] }),
      baseParams
    )

    expect(response.status).toBe(200)
    expect(prismaMock.carouselImage.deleteMany).toHaveBeenCalledWith({ where: { storeId: 'store-1' } })
    expect(prismaMock.carouselImage.createMany).toHaveBeenCalledWith({
      data: [{ imageUrl: 'https://x/1.png', storeId: 'store-1', imageCredit: 'me' }]
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest('POST', { images: [] }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when images is missing', async () => {
    const response = await POST(makeRequest('POST', {}), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.carouselImage.deleteMany.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest('POST', { images: [] }), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('PATCH /api/[storeId]/billboards/carousel', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.carouselImage.deleteMany.mockResolvedValue({ count: 1 })
    prismaMock.carouselImage.createMany.mockResolvedValue({ count: 1 })
  })

  it('replaces the carousel images for the store', async () => {
    const response = await PATCH(
      makeRequest('PATCH', { images: [{ imageUrl: 'https://x/2.png', imageCredit: '' }] }),
      baseParams
    )
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(makeRequest('PATCH', { images: [] }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when images is missing', async () => {
    const response = await PATCH(makeRequest('PATCH', {}), baseParams)
    expect(response.status).toBe(400)
  })
})
