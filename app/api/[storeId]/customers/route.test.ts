import { GET } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/customers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
  })

  it('aggregates orders into one customer per email, summing order count and spend', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        emailAddress: 'a@b.com',
        customerName: 'Alice',
        phoneNumber: '555-1',
        shippingAddress: JSON.stringify({ firstName: 'Alice', lastName: 'A' }),
        totalPriceInCents: 1000
      },
      {
        emailAddress: 'a@b.com',
        customerName: 'Alice',
        phoneNumber: '555-1',
        shippingAddress: JSON.stringify({ firstName: 'Alice', lastName: 'A' }),
        totalPriceInCents: 500
      },
      {
        emailAddress: 'c@d.com',
        customerName: 'Carl',
        phoneNumber: '555-2',
        shippingAddress: '',
        totalPriceInCents: 2000
      }
    ])

    const response = await GET(new Request('http://localhost/api/store-1/customers'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    const alice = data.find((c: any) => c.email === 'a@b.com')
    expect(alice.totalOrders).toBe(2)
    expect(alice.totalSpent).toBe(15)
    const carl = data.find((c: any) => c.email === 'c@d.com')
    expect(carl.totalOrders).toBe(1)
    expect(carl.totalSpent).toBe(20)
  })

  it('skips orders with no email address', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      { emailAddress: '', customerName: '', phoneNumber: '', shippingAddress: '', totalPriceInCents: 500 }
    ])

    const response = await GET(new Request('http://localhost/api/store-1/customers'), baseParams)
    const data = await response.json()

    expect(data).toEqual([])
  })

  it('tolerates malformed shippingAddress JSON without throwing', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        emailAddress: 'a@b.com',
        customerName: 'Alice',
        phoneNumber: '555-1',
        shippingAddress: '{not valid json',
        totalPriceInCents: 1000
      }
    ])

    const response = await GET(new Request('http://localhost/api/store-1/customers'), baseParams)

    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await GET(new Request('http://localhost/api/store-1/customers'), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(
      new Request('http://localhost/api/customers'),
      { params: Promise.resolve({ storeId: '' }) }
    )
    expect(response.status).toBe(400)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/api/store-1/customers'), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.order.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/api/store-1/customers'), baseParams)
    expect(response.status).toBe(500)
  })
})
