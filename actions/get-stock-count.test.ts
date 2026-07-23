import { getStockCount } from './get-stock-count'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

describe('getStockCount', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('counts non-archived products with positive quantity for the store', async () => {
    prismaMock.product.count.mockResolvedValue(7)

    const result = await getStockCount('store-1')

    expect(result).toBe(7)
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: {
        storeId: 'store-1',
        isArchived: false,
        quantity: { gt: 0 }
      }
    })
  })

  it('returns 0 when no products are in stock', async () => {
    prismaMock.product.count.mockResolvedValue(0)

    const result = await getStockCount('store-1')

    expect(result).toBe(0)
  })
})
