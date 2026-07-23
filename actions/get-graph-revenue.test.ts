import { getGraphRevenue, getOrderYears } from './get-graph-revenue'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

describe('getGraphRevenue', () => {
  beforeEach(() => jest.resetAllMocks())

  it('buckets paid-order revenue and order counts by month', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        createdAt: new Date(2026, 0, 15),
        orderItems: [{ priceInCents: 1000 }, { priceInCents: 500 }]
      },
      {
        createdAt: new Date(2026, 0, 20),
        orderItems: [{ priceInCents: 2000 }]
      },
      {
        createdAt: new Date(2026, 2, 1),
        orderItems: [{ priceInCents: 400 }]
      }
    ])

    const result = await getGraphRevenue('store-1', 2026)

    expect(result[0]).toEqual({ name: 'Jan', total: 35, orders: 2 })
    expect(result[2]).toEqual({ name: 'Mar', total: 4, orders: 1 })
    expect(result[1]).toEqual({ name: 'Feb', total: 0, orders: 0 })
  })

  it('filters by the given year when provided', async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    await getGraphRevenue('store-1', 2026)

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          storeId: 'store-1',
          isPaid: true,
          createdAt: {
            gte: new Date(2026, 0, 1),
            lt: new Date(2027, 0, 1)
          }
        })
      })
    )
  })

  it('does not filter by date when no year is given', async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    await getGraphRevenue('store-1')

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { storeId: 'store-1', isPaid: true } })
    )
  })

  it('returns all 12 months at 0 when there is no revenue', async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    const result = await getGraphRevenue('store-1', 2026)

    expect(result).toHaveLength(12)
    expect(result.every((m) => m.total === 0 && m.orders === 0)).toBe(true)
  })
})

describe('getOrderYears', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns distinct years from paid orders, most recent first', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      { createdAt: new Date(2024, 4, 1) },
      { createdAt: new Date(2026, 0, 1) },
      { createdAt: new Date(2024, 10, 1) }
    ])

    const result = await getOrderYears('store-1')

    expect(result).toEqual([2026, 2024])
  })

  it('returns an empty array when there are no paid orders', async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    const result = await getOrderYears('store-1')

    expect(result).toEqual([])
  })
})
