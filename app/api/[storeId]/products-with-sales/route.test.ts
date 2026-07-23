import { GET } from './route'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/products-with-sales', () => {
  beforeEach(() => jest.resetAllMocks())

  it('attaches saleInfo to each product', async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { id: 'p1', priceInCents: 1000, quantity: 5 },
      { id: 'p2', priceInCents: 2000, quantity: 3 }
    ])
    prismaMock.sale.findMany.mockResolvedValue([
      {
        id: 'sale-1',
        name: 'Storewide',
        isStoreWide: true,
        percentage: 10,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        products: []
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toHaveLength(2)
    expect(data[0].saleInfo.hasActiveSale).toBe(true)
    expect(data[0].saleInfo.salePriceInCents).toBe(900)
    expect(data[1].saleInfo.salePriceInCents).toBe(1800)
  })

  it('never applies a sale to a sold-out product', async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: 'p1', priceInCents: 1000, quantity: 0 }])
    prismaMock.sale.findMany.mockResolvedValue([
      {
        id: 'sale-1',
        isStoreWide: true,
        percentage: 50,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        products: []
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data[0].saleInfo.hasActiveSale).toBe(false)
  })

  it('limits results to amountToFetch when provided', async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { id: 'p1', priceInCents: 1000, quantity: 1 },
      { id: 'p2', priceInCents: 1000, quantity: 1 }
    ])
    prismaMock.sale.findMany.mockResolvedValue([])

    const response = await GET(new Request('http://localhost/x?amountToFetch=1'), baseParams)
    const data = await response.json()

    expect(data).toHaveLength(1)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
