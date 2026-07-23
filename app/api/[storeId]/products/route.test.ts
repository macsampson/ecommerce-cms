import { POST, GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

const validBody = {
  name: 'Widget',
  price: 19.99,
  quantity: 5,
  description: 'desc',
  weight: 1,
  variations: [],
  categoryId: 'cat-1',
  colorId: 'col-1',
  sizeId: 'size-1',
  images: [{ url: 'https://x/1.png', credit: '' }],
  bundles: [],
  isArchived: false,
  isFeatured: false
}

function makeRequest(body: any) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/[storeId]/products', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    delete process.env.DISABLE_AUTH_FOR_LOCAL_DEV
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.product.create.mockResolvedValue({ id: 'p1' })
  })

  it('creates a product, converting the dollar price to cents', async () => {
    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ priceInCents: 1999, storeId: 'store-1' })
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest(validBody), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const response = await POST(makeRequest({ ...validBody, name: undefined }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when there are no images (outside local-dev bypass)', async () => {
    const response = await POST(makeRequest({ ...validBody, images: [] }), baseParams)
    expect(response.status).toBe(400)
  })

  it('allows an empty images array when DISABLE_AUTH_FOR_LOCAL_DEV is set', async () => {
    process.env.DISABLE_AUTH_FOR_LOCAL_DEV = 'true'

    const response = await POST(makeRequest({ ...validBody, images: [] }), baseParams)
    expect(response.status).toBe(200)
    delete process.env.DISABLE_AUTH_FOR_LOCAL_DEV
  })

  it('returns 400 when price is missing', async () => {
    const response = await POST(makeRequest({ ...validBody, price: undefined }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when categoryId is missing', async () => {
    const response = await POST(makeRequest({ ...validBody, categoryId: undefined }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when weight is missing', async () => {
    const response = await POST(makeRequest({ ...validBody, weight: undefined }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest(validBody), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.product.create.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest(validBody), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('GET /api/[storeId]/products', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns products for the store, excluding archived ones', async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toEqual([{ id: 'p1' }, { id: 'p2' }])
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isArchived: false }) })
    )
  })

  it('limits results to amountToFetch when provided', async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }])

    const response = await GET(
      new Request('http://localhost/x?amountToFetch=2'),
      baseParams
    )
    const data = await response.json()

    expect(data).toHaveLength(2)
  })

  it('excludes a specific product when excludeProductId is provided', async () => {
    prismaMock.product.findMany.mockResolvedValue([])

    await GET(new Request('http://localhost/x?excludeProductId=p1'), baseParams)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: 'p1' } }) })
    )
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(new Request('http://localhost/x'), { params: Promise.resolve({ storeId: '' }) })
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
