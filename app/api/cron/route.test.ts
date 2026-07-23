import { POST } from './route'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

function makeRequest() {
  return new Request('http://localhost/api/cron', { method: 'POST' }) as any
}

describe('POST /api/cron', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    prismaMock.sale.findMany.mockResolvedValue([])
  })

  it('reports no abandoned orders when none are found', async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    const response = await POST(makeRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toContain('No abandoned orders found')
    expect(prismaMock.order.update).not.toHaveBeenCalled()
    expect(prismaMock.product.update).not.toHaveBeenCalled()
  })

  it('marks stale unpaid orders as abandoned and re-increments product inventory for each item', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        orderItems: [
          { productId: 'p1', quantity: 2, product: { id: 'p1' } },
          { productId: 'p2', quantity: 1, product: { id: 'p2' } }
        ]
      }
    ])
    prismaMock.order.update.mockResolvedValue({})
    prismaMock.product.update.mockResolvedValue({})

    const response = await POST(makeRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { isAbandoned: true }
    })
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { quantity: { increment: 2 } }
    })
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'p2' },
      data: { quantity: { increment: 1 } }
    })
    expect(data.message).toContain('Released inventory for 1 abandoned orders')
  })

  it('activates sales whose window has started and deactivates sales whose window has ended', async () => {
    prismaMock.order.findMany.mockResolvedValue([])
    prismaMock.sale.findMany
      .mockResolvedValueOnce([{ id: 'sale-1', name: 'Summer Sale' }]) // activate query
      .mockResolvedValueOnce([{ id: 'sale-2', name: 'Winter Sale' }]) // deactivate query
    prismaMock.sale.update.mockResolvedValue({})

    const response = await POST(makeRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prismaMock.sale.update).toHaveBeenCalledWith({
      where: { id: 'sale-1' },
      data: { isActive: true }
    })
    expect(prismaMock.sale.update).toHaveBeenCalledWith({
      where: { id: 'sale-2' },
      data: { isActive: false }
    })
    expect(data.message).toContain('Activated 1 sales')
    expect(data.message).toContain('Deactivated 1 sales')
  })

  it('returns 500 if a database error occurs', async () => {
    prismaMock.order.findMany.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest())

    expect(response.status).toBe(500)
  })
})
