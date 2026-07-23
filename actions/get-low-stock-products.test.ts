import { getLowStockProducts, LOW_STOCK_THRESHOLD } from './get-low-stock-products'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

describe('getLowStockProducts', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('queries non-archived products at or below the low-stock threshold, ordered ascending, limited to 6', async () => {
    prismaMock.product.findMany.mockResolvedValue([])

    await getLowStockProducts('store-1')

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: {
        storeId: 'store-1',
        isArchived: false,
        quantity: { lte: LOW_STOCK_THRESHOLD }
      },
      include: { color: true, size: true },
      orderBy: { quantity: 'asc' },
      take: 6
    })
  })

  it('maps color and size relations down to their names, defaulting to null when absent', async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'Widget', quantity: 1, color: { name: 'Red' }, size: null },
      { id: 'p2', name: 'Gadget', quantity: 2, color: null, size: { name: 'L' } }
    ])

    const result = await getLowStockProducts('store-1')

    expect(result).toEqual([
      { id: 'p1', name: 'Widget', quantity: 1, color: 'Red', size: null },
      { id: 'p2', name: 'Gadget', quantity: 2, color: null, size: 'L' }
    ])
  })

  it('returns an empty array when nothing is low on stock', async () => {
    prismaMock.product.findMany.mockResolvedValue([])

    const result = await getLowStockProducts('store-1')

    expect(result).toEqual([])
  })
})
