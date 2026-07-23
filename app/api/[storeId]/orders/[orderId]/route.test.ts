import { GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock
const baseParams = { params: Promise.resolve({ storeId: 'store-1', orderId: 'order-1' }) }

describe('GET /api/[storeId]/orders/[orderId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('returns the order with computed total parcel weight', async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: 'order-1',
      customerName: 'Jane Doe',
      emailAddress: 'a@b.com',
      phoneNumber: '555-1234',
      isPaid: true,
      shippingAddress: '123 Main St, Springfield, IL 62701, US',
      shipToAddress: null,
      shippingLabel: null,
      orderItems: [
        { id: 'i1', product: { name: 'Shirt' }, productVariation: null, quantity: 2, weight: 100 },
        { id: 'i2', product: { name: 'Hat' }, productVariation: { name: 'Blue' }, quantity: 1, weight: 50 }
      ]
    })

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.order.orderItems).toHaveLength(2)
    expect(data.order.orderItems[1].variation).toBe('Blue')
    expect(data.defaultParcel.weightGrams).toBe(250) // 100*2 + 50*1
    expect(data.parsedAddress.city).toBe('Springfield')
  })

  it('falls back to "Unknown Product" for an order item whose product no longer exists', async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: 'order-1',
      customerName: '',
      emailAddress: '',
      phoneNumber: '',
      isPaid: false,
      shippingAddress: '',
      shipToAddress: null,
      shippingLabel: null,
      orderItems: [{ id: 'i1', product: null, productVariation: null, quantity: 1, weight: 10 }]
    })

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data.order.orderItems[0].name).toBe('Unknown Product')
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 404 when the order does not exist for this store', async () => {
    prismaMock.order.findFirst.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(404)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.order.findFirst.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
