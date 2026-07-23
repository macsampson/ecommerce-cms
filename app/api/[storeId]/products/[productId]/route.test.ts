import { GET, PATCH, DELETE } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')
jest.mock('axios', () => ({ post: jest.fn(() => Promise.resolve()) }))

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', productId: 'p1' }) }

describe('GET /api/[storeId]/products/[productId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    prismaMock.sale.findMany.mockResolvedValue([])
  })

  it('returns null when the product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toBeNull()
  })

  it('does not apply any sale to a sold-out product, even if an active sale exists', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 'p1', priceInCents: 1000, quantity: 0 })
    prismaMock.sale.findMany.mockResolvedValue([
      { id: 'sale-1', isStoreWide: true, percentage: 50, products: [] }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data.saleInfo.hasActiveSale).toBe(false)
    expect(data.saleInfo.salePriceInCents).toBeNull()
  })

  it('applies a store-wide active sale to an in-stock product', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 'p1', priceInCents: 1000, quantity: 5 })
    prismaMock.sale.findMany.mockResolvedValue([
      {
        id: 'sale-1',
        name: 'Storewide',
        isStoreWide: true,
        percentage: 20,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        products: []
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data.saleInfo.hasActiveSale).toBe(true)
    expect(data.saleInfo.salePriceInCents).toBe(800)
  })

  it('applies a product-specific sale only when this product is included in it', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 'p1', priceInCents: 1000, quantity: 5 })
    prismaMock.sale.findMany.mockResolvedValue([
      {
        id: 'sale-1',
        name: 'Product Sale',
        isStoreWide: false,
        percentage: 30,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        products: [{ productId: 'someone-else' }]
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data.saleInfo.hasActiveSale).toBe(false)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.product.findUnique.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('PATCH /api/[storeId]/products/[productId]', () => {
  const validBody = {
    name: 'Widget',
    images: [{ url: 'https://x/1.png', credit: '', ordering: 0 }],
    quantity: 5,
    description: 'desc',
    weight: 1,
    categoryId: 'cat-1',
    colorId: null,
    sizeId: null,
    price: 19.99,
    variations: [],
    bundles: [],
    isFeatured: false,
    isArchived: false
  }

  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'p1',
      variations: [],
      bundles: [],
      images: []
    })
    prismaMock.product.update.mockResolvedValue({})
    prismaMock.productVariation.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.image.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.image.findMany.mockResolvedValue([])
    prismaMock.image.update.mockResolvedValue({})
    prismaMock.image.createMany.mockResolvedValue({ count: 0 })
    prismaMock.bundle.deleteMany.mockResolvedValue({ count: 0 })
  })

  it('converts the dollar price to cents when updating', async () => {
    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify(validBody) }),
      baseParams
    )

    expect(response.status).toBe(200)
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priceInCents: 1999 }) })
    )
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify(validBody) }),
      baseParams
    )
    expect(response.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify({ ...validBody, name: undefined }) }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when no images are provided (outside local-dev bypass)', async () => {
    delete process.env.DISABLE_AUTH_FOR_LOCAL_DEV
    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify({ ...validBody, images: [] }) }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('allows an empty images array when DISABLE_AUTH_FOR_LOCAL_DEV is set', async () => {
    process.env.DISABLE_AUTH_FOR_LOCAL_DEV = 'true'
    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify({ ...validBody, images: [] }) }),
      baseParams
    )
    expect(response.status).toBe(200)
    delete process.env.DISABLE_AUTH_FOR_LOCAL_DEV
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify(validBody) }),
      baseParams
    )
    expect(response.status).toBe(403)
  })

  it('returns 404 when the product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify(validBody) }),
      baseParams
    )
    expect(response.status).toBe(404)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.product.update.mockRejectedValue(new Error('db down'))

    const response = await PATCH(
      new Request('http://localhost/x', { method: 'PATCH', body: JSON.stringify(validBody) }),
      baseParams
    )
    expect(response.status).toBe(500)
  })
})

describe('DELETE /api/[storeId]/products/[productId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('deletes the product', async () => {
    prismaMock.product.deleteMany.mockResolvedValue({ count: 1 })

    const response = await DELETE(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await DELETE(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await DELETE(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.product.deleteMany.mockRejectedValue(new Error('db down'))

    const response = await DELETE(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
