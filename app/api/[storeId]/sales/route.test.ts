import { POST, GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

function makeRequest(body: any) {
  return new Request('http://localhost/api/store-1/sales', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

const validBody = {
  name: 'Summer Sale',
  description: 'desc',
  percentage: 25,
  startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-30T00:00:00.000Z',
  isActive: true,
  isStoreWide: false,
  productIds: ['p1', 'p2']
}

describe('POST /api/[storeId]/sales', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.sale.findMany.mockResolvedValue([])
    prismaMock.sale.create.mockResolvedValue({ id: 'sale-1', ...validBody })
  })

  it('creates a product-specific sale when there is no conflict', async () => {
    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.sale.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Summer Sale',
          percentage: 25,
          products: { createMany: { data: [{ productId: 'p1' }, { productId: 'p2' }] } }
        })
      })
    )
  })

  it('creates a store-wide sale without product associations', async () => {
    const response = await POST(
      makeRequest({ ...validBody, isStoreWide: true, productIds: undefined }),
      baseParams
    )

    expect(response.status).toBe(200)
    expect(prismaMock.sale.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ products: undefined }) })
    )
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(401)
    expect(prismaMock.sale.create).not.toHaveBeenCalled()
  })

  it('returns 400 when a required field is missing', async () => {
    const response = await POST(makeRequest({ ...validBody, name: undefined }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(403)
  })

  it('returns 400 when percentage is out of range', async () => {
    const tooHigh = await POST(makeRequest({ ...validBody, percentage: 101 }), baseParams)
    expect(tooHigh.status).toBe(400)

    const negative = await POST(makeRequest({ ...validBody, percentage: -1 }), baseParams)
    expect(negative.status).toBe(400)
  })

  it('returns 400 when startDate is not before endDate', async () => {
    const response = await POST(
      makeRequest({ ...validBody, startDate: '2026-06-30T00:00:00.000Z', endDate: '2026-06-01T00:00:00.000Z' }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 for a non-store-wide sale with no product IDs', async () => {
    const response = await POST(
      makeRequest({ ...validBody, isStoreWide: false, productIds: [] }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when a store-wide sale overlaps an existing active sale', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      { id: 'existing', isStoreWide: false, products: [] }
    ])

    const response = await POST(
      makeRequest({ ...validBody, isStoreWide: true, productIds: undefined }),
      baseParams
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toContain('Store-wide sale conflicts')
  })

  it('returns 400 when creating a product sale while a store-wide sale is active', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      { id: 'existing', isStoreWide: true, products: [] }
    ])

    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(400)
    expect(await response.text()).toContain('active store-wide sale')
  })

  it('returns 400 when a product is already in another active sale', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      { id: 'existing', isStoreWide: false, products: [{ productId: 'p1' }] }
    ])

    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(400)
    expect(await response.text()).toContain('already in an active sale')
  })

  it('returns 500 on a database error', async () => {
    prismaMock.sale.create.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest(validBody), baseParams)

    expect(response.status).toBe(500)
  })
})

describe('GET /api/[storeId]/sales', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns sales for the store', async () => {
    prismaMock.sale.findMany.mockResolvedValue([{ id: 'sale-1' }])

    const response = await GET(new Request('http://localhost/api/store-1/sales'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([{ id: 'sale-1' }])
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(
      new Request('http://localhost/api/sales'),
      { params: Promise.resolve({ storeId: '' }) }
    )
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.sale.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/api/store-1/sales'), baseParams)

    expect(response.status).toBe(500)
  })
})
