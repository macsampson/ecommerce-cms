import { GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/orders-summary', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('formats orders, grouping order items by product name with variation/quantity lines', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        emailAddress: 'a@b.com',
        billingAddress: '123 Main St',
        shippingAddress: '123 Main St',
        phoneNumber: '555-1234',
        customerName: 'Jane Doe',
        totalPriceInCents: 2500,
        isPaid: true,
        isAbandoned: false,
        shippingLabel: null,
        createdAt: new Date(2026, 0, 15, 10, 30),
        orderItems: [
          { product: { name: 'Shirt' }, productVariation: { name: 'Red / M' }, quantity: 2 },
          { product: { name: 'Shirt' }, productVariation: null, quantity: 1 }
        ]
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toHaveLength(1)
    expect(data[0].products).toContain('Shirt')
    expect(data[0].products).toContain('Red / M x2')
    expect(data[0].products).toContain('Standard x1')
    expect(data[0].variations).toBe('Red / M, Standard')
    expect(data[0].hasShippingLabel).toBe(false)
    expect(data[0].totalPrice).toBe('$25.00')
  })

  it('falls back to "Unknown Product" when the linked product no longer exists', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        emailAddress: '',
        billingAddress: '',
        shippingAddress: '',
        phoneNumber: '',
        customerName: '',
        totalPriceInCents: 0,
        isPaid: false,
        isAbandoned: false,
        shippingLabel: null,
        createdAt: new Date(2026, 0, 1),
        orderItems: [{ product: null, productVariation: null, quantity: 1 }]
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data[0].products).toContain('Unknown Product')
    expect(data[0].totalPrice).toBe('N/A')
  })

  it('reports hasShippingLabel true when a shipping label is present', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        emailAddress: '',
        billingAddress: '',
        shippingAddress: '',
        phoneNumber: '',
        customerName: '',
        totalPriceInCents: 100,
        isPaid: true,
        isAbandoned: false,
        shippingLabel: { url: 'https://x/label.pdf' },
        createdAt: new Date(),
        orderItems: []
      }
    ])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data[0].hasShippingLabel).toBe(true)
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

  it('returns 500 on a database error', async () => {
    prismaMock.order.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
