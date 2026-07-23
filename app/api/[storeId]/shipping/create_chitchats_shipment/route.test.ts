import { POST } from './route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/shipping-config', () => ({
  getChitchatsConfig: jest.fn((settings: any) => ({
    apiKey: settings?.chitchatsApiKey || undefined,
    apiUrl: settings?.chitchatsApiUrl || undefined,
    clientId: settings?.chitchatsClientId || undefined
  }))
}))

const prismaMock = prismadb as any
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

const validBody = {
  address: {
    firstName: 'Jane',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    country: 'US',
    email: 'jane@example.com'
  },
  cartItems: [
    { item: { id: 'p1', name: 'Widget', priceInCents: 1000, weight: '100' }, totalQuantity: 2 }
  ],
  currency: 'usd',
  totalPrice: 2000,
  totalWeight: 200,
  selectedPostageType: 'chit_chats_us_edge'
}

function makeRequest(body: any) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/[storeId]/shipping/create_chitchats_shipment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    prismaMock.shippingSettings.findUnique.mockResolvedValue({
      storeId: 'store-1',
      chitchatsApiKey: 'cc_key',
      chitchatsApiUrl: 'https://api.chitchats.com',
      chitchatsClientId: 'client-1',
      chitchatsEnabled: true
    })
  })

  it('creates a Chit Chats shipment and returns it', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ shipment: { id: 'ship_1', status: 'unpaid' } })
    })

    const response = await POST(makeRequest(validBody) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.shipment).toEqual({ id: 'ship_1', status: 'unpaid' })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.chitchats.com/api/v1/clients/client-1/shipments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'cc_key' })
      })
    )
  })

  it('returns 400 when required shipment details are missing', async () => {
    const response = await POST(makeRequest({ ...validBody, cartItems: [] }) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 500 when Chit Chats is not fully configured', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({
      storeId: 'store-1',
      chitchatsApiKey: null,
      chitchatsApiUrl: null,
      chitchatsClientId: null,
      chitchatsEnabled: false
    })

    const response = await POST(makeRequest(validBody) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('propagates a Chit Chats API error with its status code', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({ error: { message: 'Invalid postal code' } })
    })

    const response = await POST(makeRequest(validBody) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/Invalid postal code/)
  })

  it('treats a 200 response containing an error field as a failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ error: { message: 'Something odd' } })
    })

    const response = await POST(makeRequest(validBody) as any, baseParams)
    const data = await response.json()

    expect(data.success).toBe(false)
  })

  it('returns 500 if an unexpected error is thrown', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('network error'))

    const response = await POST(makeRequest(validBody) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('network error')
  })
})
