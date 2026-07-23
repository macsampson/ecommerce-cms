import { GET } from './route'
import { stripe } from '@/lib/stripe'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn()
      }
    }
  }
}))

const retrieveMock = stripe.checkout.sessions.retrieve as jest.Mock

function makeRequest() {
  return new Request('http://localhost/api/store-1/checkout/sess_1')
}

const baseParams = { params: Promise.resolve({ sessionId: 'sess_1' }) }

describe('GET /api/[storeId]/checkout/[sessionId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns the customer name and email when customer_details is present', async () => {
    retrieveMock.mockResolvedValue({
      customer_details: { name: 'Jane Doe', email: 'jane@example.com' }
    })

    const response = await GET(makeRequest(), baseParams)

    expect(response).toBeDefined()
    const data = JSON.parse(await (response as Response).text())
    expect(data).toEqual({ name: 'Jane Doe', email: 'jane@example.com' })
  })

  it('returns an error response when Stripe retrieval fails', async () => {
    const error: any = new Error('No such checkout session')
    error.statusCode = 404
    retrieveMock.mockRejectedValue(error)

    const response = await GET(makeRequest(), baseParams)

    expect(response).toBeDefined()
    expect((response as Response).status).toBe(404)
    expect(await (response as Response).text()).toBe('No such checkout session')
  })

  it('returns a 404 when the session has no customer_details', async () => {
    retrieveMock.mockResolvedValue({ customer_details: null })

    const response = await GET(makeRequest(), baseParams)

    expect(response).toBeDefined()
    expect((response as Response).status).toBe(404)
  })
})
