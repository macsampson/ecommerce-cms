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
    prismaMock.processedWebhookEvent.create.mockResolvedValue({
      id: 'pwe-1',
      stripeEventId: 'evt_1',
      createdAt: new Date()
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
      id: 'evt_1',
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
      id: 'evt_1',
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
    prismaMock.$executeRawUnsafe.mockResolvedValue(1)

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
    // Inventory is decremented via a single atomic, clamped SQL UPDATE rather
    // than a read-then-write, to avoid a lost-update race under concurrent
    // webhook deliveries for different orders touching the same product.
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      'UPDATE product SET quantity = GREATEST(quantity - $1, 0) WHERE id = $2',
      2,
      'product-1'
    )
  })

  it('returns 500 if order processing throws', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_1',
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

  it('creates one order item per variation and decrements each variation quantity', async () => {
    const cartItems = {
      'product-1': {
        name: 'Shirt',
        category: 'apparel',
        quantity: 1,
        priceInCents: 0,
        variations: {
          'var-1': {
            name: 'Red / M',
            priceInCents: 2000,
            cartQuantity: 3,
            inventoryAmount: 10
          },
          'var-2': {
            name: 'Blue / L',
            priceInCents: 2200,
            cartQuantity: 1,
            inventoryAmount: 2
          }
        }
      }
    }

    constructEventMock.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_1',
          amount_total: 8200,
          metadata: {
            storeId: 'store-1',
            cartItems: JSON.stringify(cartItems)
          }
        }
      }
    })

    prismaMock.order.create.mockResolvedValue({ id: 'order-1' })
    prismaMock.product.findUnique.mockResolvedValue({ id: 'product-1', quantity: 10 })
    prismaMock.productVariation.findUnique.mockImplementation(({ where }: any) => {
      const variations: Record<string, any> = {
        'var-1': { id: 'var-1', name: 'Red / M', quantity: 10 },
        'var-2': { id: 'var-2', name: 'Blue / L', quantity: 2 }
      }
      return Promise.resolve(variations[where.id])
    })
    prismaMock.orderItem.create.mockResolvedValue({ id: 'item-1' })
    prismaMock.$executeRawUnsafe.mockResolvedValue(1)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    expect(prismaMock.orderItem.create).toHaveBeenCalledTimes(2)
    expect(prismaMock.orderItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: 'product-1',
        productVariationId: 'var-1',
        quantity: 3,
        priceInCents: 2000,
        name: 'Shirt - Red / M'
      })
    })
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      'UPDATE product_variation SET quantity = GREATEST(quantity - $1, 0) WHERE id = $2',
      3,
      'var-1'
    )
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      'UPDATE product_variation SET quantity = GREATEST(quantity - $1, 0) WHERE id = $2',
      1,
      'var-2'
    )
    // main product inventory is untouched for variation items — only the two
    // product_variation updates above should have happened
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledTimes(2)
  })

  it('floors variation inventory at 0 when cart quantity exceeds stock', async () => {
    const cartItems = {
      'product-1': {
        name: 'Shirt',
        category: 'apparel',
        quantity: 1,
        priceInCents: 0,
        variations: {
          'var-1': {
            name: 'Red / M',
            priceInCents: 2000,
            cartQuantity: 5,
            inventoryAmount: 2
          }
        }
      }
    }

    constructEventMock.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_1',
          amount_total: 10000,
          metadata: { storeId: 'store-1', cartItems: JSON.stringify(cartItems) }
        }
      }
    })

    prismaMock.order.create.mockResolvedValue({ id: 'order-1' })
    prismaMock.product.findUnique.mockResolvedValue({ id: 'product-1', quantity: 10 })
    prismaMock.productVariation.findUnique.mockResolvedValue({ id: 'var-1', name: 'Red / M', quantity: 2 })
    prismaMock.orderItem.create.mockResolvedValue({ id: 'item-1' })
    prismaMock.$executeRawUnsafe.mockResolvedValue(1)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    // The floor-at-zero clamping (GREATEST(quantity - $1, 0)) happens inside
    // the SQL itself now, so this asserts the query is issued with the raw
    // requested cart quantity — the database does the clamping.
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      'UPDATE product_variation SET quantity = GREATEST(quantity - $1, 0) WHERE id = $2',
      5,
      'var-1'
    )
  })

  it('floors main product inventory at 0 when cart quantity exceeds stock', async () => {
    const cartItems = {
      'product-1': { name: 'Widget', category: 'misc', quantity: 5, priceInCents: 1500 }
    }

    constructEventMock.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_1',
          amount_total: 7500,
          metadata: { storeId: 'store-1', cartItems: JSON.stringify(cartItems) }
        }
      }
    })

    prismaMock.order.create.mockResolvedValue({ id: 'order-1' })
    prismaMock.product.findUnique.mockResolvedValue({ id: 'product-1', quantity: 2 })
    prismaMock.orderItem.create.mockResolvedValue({ id: 'item-1' })
    prismaMock.$executeRawUnsafe.mockResolvedValue(1)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      'UPDATE product SET quantity = GREATEST(quantity - $1, 0) WHERE id = $2',
      5,
      'product-1'
    )
  })

  it('skips cart items whose product no longer exists, without creating an order item', async () => {
    const cartItems = {
      'missing-product': { name: 'Ghost', category: 'misc', quantity: 1, priceInCents: 500 }
    }

    constructEventMock.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_1',
          amount_total: 500,
          metadata: { storeId: 'store-1', cartItems: JSON.stringify(cartItems) }
        }
      }
    })

    prismaMock.order.create.mockResolvedValue({ id: 'order-1' })
    prismaMock.product.findUnique.mockResolvedValue(null)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    expect(prismaMock.orderItem.create).not.toHaveBeenCalled()
    expect(prismaMock.$executeRawUnsafe).not.toHaveBeenCalled()
  })

  it('returns 200 without processing an order for unrelated Stripe event types', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: { object: {} }
    })

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    expect(prismaMock.order.create).not.toHaveBeenCalled()
    // Not "processed" as a checkout completion, so we don't record idempotency for it either
    expect(prismaMock.processedWebhookEvent.create).not.toHaveBeenCalled()
  })

  it('ignores a redelivered event it has already processed, without creating a duplicate order', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt_1',
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
    const duplicateError: any = new Error('Unique constraint failed')
    duplicateError.code = 'P2002'
    prismaMock.processedWebhookEvent.create.mockRejectedValue(duplicateError)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(200)
    expect(prismaMock.order.create).not.toHaveBeenCalled()
  })
})
