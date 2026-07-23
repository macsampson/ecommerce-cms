import { GET, PATCH, DELETE } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', saleId: 'sale-1' }) }

function makeRequest(method: string, body?: any) {
  return new Request('http://localhost/api/store-1/sales/sale-1', {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('GET /api/[storeId]/sales/[saleId]', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns the sale', async () => {
    prismaMock.sale.findUnique.mockResolvedValue({ id: 'sale-1' })

    const response = await GET(makeRequest('GET'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ id: 'sale-1' })
  })

  it('returns 400 when saleId is missing', async () => {
    const response = await GET(makeRequest('GET'), {
      params: Promise.resolve({ storeId: 'store-1', saleId: '' })
    })
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.sale.findUnique.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('GET'), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('PATCH /api/[storeId]/sales/[saleId]', () => {
  const validBody = {
    name: 'Updated Sale',
    percentage: 30,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
    isStoreWide: false,
    productIds: ['p1']
  }

  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.sale.findMany.mockResolvedValue([])
    prismaMock.sale.update.mockResolvedValue({ id: 'sale-1' })
    prismaMock.saleProduct.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.saleProduct.createMany.mockResolvedValue({ count: 1 })
    prismaMock.sale.findUnique.mockResolvedValue({ id: 'sale-1', ...validBody })
  })

  it('updates the sale and replaces product associations', async () => {
    const response = await PATCH(makeRequest('PATCH', validBody), baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.saleProduct.deleteMany).toHaveBeenCalledWith({ where: { saleId: 'sale-1' } })
    expect(prismaMock.saleProduct.createMany).toHaveBeenCalledWith({
      data: [{ saleId: 'sale-1', productId: 'p1' }]
    })
  })

  it('excludes the current sale from the overlap check', async () => {
    await PATCH(makeRequest('PATCH', validBody), baseParams)

    expect(prismaMock.sale.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: 'sale-1' } })
      })
    )
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(makeRequest('PATCH', validBody), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await PATCH(makeRequest('PATCH', validBody), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 400 when percentage is out of range', async () => {
    const response = await PATCH(makeRequest('PATCH', { ...validBody, percentage: 150 }), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when startDate is not before endDate', async () => {
    const response = await PATCH(
      makeRequest('PATCH', { ...validBody, startDate: validBody.endDate, endDate: validBody.startDate }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when switching to product-specific with an empty product list', async () => {
    const response = await PATCH(
      makeRequest('PATCH', { ...validBody, isStoreWide: false, productIds: [] }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when the update would conflict with an active store-wide sale', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      { id: 'other', isStoreWide: true, products: [] }
    ])

    const response = await PATCH(makeRequest('PATCH', validBody), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when a product is already in another active sale', async () => {
    prismaMock.sale.findMany.mockResolvedValue([
      { id: 'other', isStoreWide: false, products: [{ productId: 'p1' }] }
    ])

    const response = await PATCH(makeRequest('PATCH', validBody), baseParams)
    expect(response.status).toBe(400)
  })

  it('skips the overlap check entirely when neither startDate nor endDate is being changed', async () => {
    const response = await PATCH(makeRequest('PATCH', { name: 'Renamed Only' }), baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.sale.findMany).not.toHaveBeenCalled()
  })

  it('returns 500 on a database error', async () => {
    prismaMock.sale.update.mockRejectedValue(new Error('db down'))

    const response = await PATCH(makeRequest('PATCH', validBody), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('DELETE /api/[storeId]/sales/[saleId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('deletes the sale', async () => {
    prismaMock.sale.delete.mockResolvedValue({ id: 'sale-1' })

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(401)
    expect(prismaMock.sale.delete).not.toHaveBeenCalled()
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.sale.delete.mockRejectedValue(new Error('db down'))

    const response = await DELETE(makeRequest('DELETE'), baseParams)
    expect(response.status).toBe(500)
  })
})
