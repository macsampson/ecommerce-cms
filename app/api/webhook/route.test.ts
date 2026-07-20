import { POST } from './route'
import prismadb from '@/lib/prismadb'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn()
    }
  }
}))

jest.mock('next/headers', () => ({
  headers: jest.fn()
}))

const constructEventMock = stripe.webhooks.constructEvent as jest.Mock
const prismaMock = prismadb as any

function makeRequest(body: string) {
  return new Request('http://localhost/api/webhook', { method: 'POST', body })
}

describe('POST /api/webhook', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(headers as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'test-signature')
    })
  })

  it('rejects requests with an invalid Stripe signature', async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error('invalid signature')
    })

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(400)
    expect(await response.text()).toContain('Webhook Error')
  })

  it('rejects a completed checkout session with no storeId in metadata', async () => {
    constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'sess_1', metadata: {} } }
    })

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(400)
    expect(prismaMock.order.create).not.toHaveBeenCalled()
  })

  it('creates an order and order items, and decrements inventory, on a completed checkout session', async () => {
    const cartItems = {
      'product-1': {
        name: 'Widget',
        category: 'misc',
        quantity: 2,
        priceInCents: 1500
      }
    }

    constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_1',
          amount_total: 3000,
          customer_details: {
            email: 'buyer@example.com',
            name: 'Buyer Name',
            phone: '555-1234',
            address: {
              line1: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              postal_code: '62701',
              country: 'US'
            }
          },
          metadata: {
            storeId: 'store-1',
            shippingAddress: JSON.stringify({
              email: 'buyer@example.com',
              firstName: 'Buyer',
              lastName: 'Name',
              street: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              zip: '62701',
              country: 'US'
            }),
            shippingType: JSON.stringify({ title: 'Standard' }),
            currency: 'usd',
            cartItems: JSON.stringify(cartItems)
          }
        }
      }
    })

    prismaMock.order.create.mockResolvedValue({ id: 'order-1' })
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'product-1',
      quantity: 10
    })
    prismaMock.orderItem.create.mockResolvedValue({ id: 'item-1' })
    prismaMock.product.update.mockResolvedValue({})

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    expect(prismaMock.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        storeId: 'store-1',
        isPaid: true,
        totalPriceInCents: 3000
      })
    })
    expect(prismaMock.orderItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        productId: 'product-1',
        quantity: 2,
        priceInCents: 1500
      })
    })
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { quantity: 8 }
    })
  })

  it('returns 500 if order processing throws', async () => {
    constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_1',
          metadata: {
            storeId: 'store-1',
            cartItems: JSON.stringify({})
          }
        }
      }
    })
    prismaMock.order.create.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(500)
  })
})
