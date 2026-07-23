import { POST } from './route'
import prismadb from '@/lib/prismadb'
import { stripe } from '@/lib/stripe'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn()
      }
    }
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(() => '127.0.0.1')
}))

const prismaMock = prismadb as any
const createSessionMock = stripe.checkout.sessions.create as jest.Mock
const rateLimitMock = rateLimit as jest.Mock

function makeRequest(body: any) {
  return new Request('http://localhost/api/store-1/checkout', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }
const validShippingAddress = {
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  country: 'US'
}

describe('POST /api/[storeId]/checkout', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    rateLimitMock.mockReturnValue({ allowed: true })
    ;(getClientIp as jest.Mock).mockReturnValue('127.0.0.1')
    prismaMock.store.findUnique.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    createSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })
  })

  it('creates a Stripe checkout session for a valid cart', async () => {
    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 2 } },
        totalPrice: 3000,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.url).toBe('https://stripe.test/session')
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 1500
            }),
            quantity: 2
          })
        ]
      })
    )
  })

  it('handles legacy "price" field when priceInCents is absent', async () => {
    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', price: '19.99', quantity: 1 } },
        totalPrice: 1999,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )

    expect(response.status).toBe(200)
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 20 })
          })
        ]
      })
    )
  })

  it('adds a shipping line item when shippingType.rate > 0', async () => {
    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 1 } },
        totalPrice: 2000,
        shippingType: { id: 'ship-1', title: 'Standard', rate: 5 },
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )

    expect(response.status).toBe(200)
    const call = createSessionMock.mock.calls[0][0]
    expect(call.line_items).toHaveLength(2)
    expect(call.line_items[1]).toEqual(
      expect.objectContaining({
        price_data: expect.objectContaining({ unit_amount: 500 }),
        quantity: 1
      })
    )
  })

  it('skips invalid (NaN) cart items and still checks out with the remaining valid ones', async () => {
    const response = await POST(
      makeRequest({
        cartItems: {
          bad: { name: 'Bad', priceInCents: 'not-a-number', quantity: 1 },
          good: { name: 'Good', priceInCents: 1000, quantity: 1 }
        },
        totalPrice: 1000,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )

    expect(response.status).toBe(200)
    const call = createSessionMock.mock.calls[0][0]
    expect(call.line_items).toHaveLength(1)
    expect(call.line_items[0].price_data.product_data.name).toBe('Good')
  })

  it('returns 400 when all cart items are invalid, leaving no valid line items', async () => {
    const response = await POST(
      makeRequest({
        cartItems: { bad: { name: 'Bad', priceInCents: 'nope', quantity: 1 } },
        totalPrice: 1000,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )

    expect(response.status).toBe(400)
    expect(createSessionMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the rate limit is exceeded', async () => {
    rateLimitMock.mockReturnValue({ allowed: false })

    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 1 } },
        totalPrice: 1500,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )

    expect(response.status).toBe(429)
    expect(createSessionMock).not.toHaveBeenCalled()
  })

  it('returns 400 for an empty cart', async () => {
    const response = await POST(
      makeRequest({ cartItems: {}, totalPrice: 0, shippingAddress: validShippingAddress, currency: 'usd' }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when totalPrice is missing', async () => {
    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 1 } },
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 400 when shippingAddress is missing', async () => {
    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 1 } },
        totalPrice: 1500,
        currency: 'usd'
      }),
      baseParams
    )
    expect(response.status).toBe(400)
  })

  it('returns 404 when the store does not exist', async () => {
    prismaMock.store.findUnique.mockResolvedValue(null)

    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 1 } },
        totalPrice: 1500,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )
    expect(response.status).toBe(404)
  })

  it('returns 500 if Stripe session creation throws', async () => {
    createSessionMock.mockRejectedValue(new Error('stripe down'))

    const response = await POST(
      makeRequest({
        cartItems: { p1: { name: 'Widget', priceInCents: 1500, quantity: 1 } },
        totalPrice: 1500,
        shippingAddress: validShippingAddress,
        currency: 'usd'
      }),
      baseParams
    )
    expect(response.status).toBe(500)
  })
})
