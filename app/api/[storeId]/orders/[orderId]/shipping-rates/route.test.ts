import { POST } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'
import { createShippoShipment } from '@/lib/shippo'

jest.mock('@/lib/auth')
jest.mock('@/lib/shippo', () => ({
  createShippoShipment: jest.fn(),
  flattenShippoError: jest.requireActual('@/lib/shippo').flattenShippoError
}))
jest.mock('@/lib/shipping-config', () => ({
  getShippoApiKey: jest.fn((settings: any) => settings?.shippoApiKey || undefined)
}))

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock
const createShippoShipmentMock = createShippoShipment as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', orderId: 'order-1' }) }

const validAddress = {
  name: 'Jane Doe',
  street1: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  country: 'US'
}
const validParcel = { weightGrams: 500, lengthCm: 20, widthCm: 15, heightCm: 5 }

function makeRequest(body: any) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/[storeId]/orders/[orderId]/shipping-rates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.order.findFirst.mockResolvedValue({
      id: 'order-1',
      totalPriceInCents: 5000,
      orderItems: [
        { product: { name: 'Widget' }, productId: 'p1', priceInCents: 1000, quantity: 2, weight: 100 }
      ]
    })
    prismaMock.shippingSettings.findUnique.mockResolvedValue({
      storeId: 'store-1',
      name: 'Acme',
      company: '',
      street1: '1 Warehouse Rd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'US',
      phone: '555-0000',
      email: 'ship@acme.com',
      shippoApiKey: 'shpk_test',
      customsDeclaration: null
    })
    prismaMock.order.update.mockResolvedValue({})
  })

  it('returns formatted rates on success', async () => {
    createShippoShipmentMock.mockResolvedValue({
      httpOk: true,
      rates: [
        {
          object_id: 'rate_1',
          provider: 'USPS',
          servicelevel: { name: 'priority', display_name: 'Priority Mail' },
          amount: '8.50',
          currency: 'USD',
          estimated_days: 3,
          duration_terms: '3 business days'
        }
      ],
      messages: [],
      raw: {}
    })

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.rates).toEqual([
      {
        id: 'rate_1',
        provider: 'Shippo',
        title: 'Priority Mail',
        description: '3 business days',
        amount: '8.50',
        currency: 'USD',
        estimated_days: 3
      }
    ])
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { shipToAddress: validAddress }
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 404 when the order does not exist', async () => {
    prismaMock.order.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    expect(response.status).toBe(404)
  })

  it('returns 400 when the recipient address is incomplete', async () => {
    const response = await POST(
      makeRequest({ address: { ...validAddress, zip: undefined }, parcel: validParcel }),
      baseParams
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/address is incomplete/)
  })

  it('returns 400 when parcel weight is zero', async () => {
    const response = await POST(
      makeRequest({ address: validAddress, parcel: { ...validParcel, weightGrams: 0 } }),
      baseParams
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/weight must be greater than 0/)
  })

  it('returns 404 when no shipping settings (sender address) exist for the store', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue(null)

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Sender address not found')
  })

  it('returns 500 when no Shippo API key is configured', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({
      storeId: 'store-1',
      name: 'Acme',
      street1: '1 Warehouse Rd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'US',
      shippoApiKey: null
    })

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Shippo API key is not configured')
  })

  it('returns 422 with a flattened error when Shippo returns no rates', async () => {
    createShippoShipmentMock.mockResolvedValue({
      httpOk: false,
      rates: [],
      messages: [],
      raw: { address_to: { zip: ['is not valid'] } }
    })

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error).toBe('address_to.zip: is not valid')
    expect(prismaMock.order.update).not.toHaveBeenCalled()
  })

  it('returns 422 using Shippo messages when present, even with an ok response and no rates', async () => {
    createShippoShipmentMock.mockResolvedValue({
      httpOk: true,
      rates: [],
      messages: [{ text: 'No service available to this destination' }],
      raw: {}
    })

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.error).toBe('No service available to this destination')
  })

  it('returns 500 if an unexpected error is thrown', async () => {
    createShippoShipmentMock.mockRejectedValue(new Error('network error'))

    const response = await POST(makeRequest({ address: validAddress, parcel: validParcel }), baseParams)
    expect(response.status).toBe(500)
  })
})
