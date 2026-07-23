import { getTotalRevenue } from './get-total-revenue'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

describe('getTotalRevenue', () => {
  beforeEach(() => jest.resetAllMocks())

  it('sums order item prices (in dollars) across all paid orders', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      { orderItems: [{ priceInCents: 1000 }, { priceInCents: 500 }] },
      { orderItems: [{ priceInCents: 2000 }] }
    ])

    const result = await getTotalRevenue('store-1')

    expect(result).toBe(35)
    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { storeId: 'store-1', isPaid: true },
      include: { orderItems: { include: { product: true } } }
    })
  })

  it('returns 0 when there are no paid orders', async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    const result = await getTotalRevenue('store-1')

    expect(result).toBe(0)
  })

  it('returns 0 for a paid order with no order items', async () => {
    prismaMock.order.findMany.mockResolvedValue([{ orderItems: [] }])

    const result = await getTotalRevenue('store-1')

    expect(result).toBe(0)
  })
})
