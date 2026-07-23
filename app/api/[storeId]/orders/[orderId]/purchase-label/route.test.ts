import { POST } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'
import { purchaseShippoLabel } from '@/lib/shippo'

jest.mock('@/lib/auth')
jest.mock('@/lib/shippo', () => ({
  purchaseShippoLabel: jest.fn()
}))
jest.mock('@/lib/shipping-config', () => ({
  getShippoApiKey: jest.fn((settings: any) => settings?.shippoApiKey || undefined)
}))

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock
const purchaseShippoLabelMock = purchaseShippoLabel as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1', orderId: 'order-1' }) }

function makeRequest(body: any) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/[storeId]/orders/[orderId]/purchase-label', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    authMock.mockResolvedValue(true)
    prismaMock.store.findFirst.mockResolvedValue({ id: 'store-1', userId: 'single-user' })
    prismaMock.order.findFirst.mockResolvedValue({ id: 'order-1', shippingLabel: null })
    prismaMock.shippingSettings.findUnique.mockResolvedValue({ storeId: 'store-1', shippoApiKey: 'shpk_test' })
    prismaMock.order.update.mockResolvedValue({})
  })

  it('purchases a label and stores it on the order', async () => {
    purchaseShippoLabelMock.mockResolvedValue({
      object_id: 'txn_1',
      status: 'SUCCESS',
      label_url: 'https://x/label.pdf',
      tracking_number: '1Z999',
      tracking_url_provider: 'https://track/1Z999'
    })

    const response = await POST(
      makeRequest({ rateObjectId: 'rate_1', rate: { provider: 'USPS', title: 'Priority', amount: '8.50', currency: 'USD' } }),
      baseParams
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.shippingLabel).toEqual(
      expect.objectContaining({
        provider: 'shippo',
        carrier: 'USPS',
        transactionId: 'txn_1',
        labelUrl: 'https://x/label.pdf',
        trackingNumber: '1Z999'
      })
    )
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { shippingLabel: expect.objectContaining({ transactionId: 'txn_1' }) }
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the store is not owned by the admin', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    expect(response.status).toBe(403)
  })

  it('returns 404 when the order does not exist', async () => {
    prismaMock.order.findFirst.mockResolvedValue(null)

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    expect(response.status).toBe(404)
  })

  it('returns 409 when a label has already been purchased for this order', async () => {
    prismaMock.order.findFirst.mockResolvedValue({ id: 'order-1', shippingLabel: { transactionId: 'txn_old' } })

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toMatch(/already purchased/)
    expect(purchaseShippoLabelMock).not.toHaveBeenCalled()
  })

  it('returns 400 when rateObjectId is missing', async () => {
    const response = await POST(makeRequest({}), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 500 when no Shippo API key is configured', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({ storeId: 'store-1', shippoApiKey: null })

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Shippo API key is not configured')
  })

  it('returns 422 when the Shippo transaction fails', async () => {
    purchaseShippoLabelMock.mockResolvedValue({
      object_id: 'txn_1',
      status: 'ERROR',
      messages: [{ text: 'Rate has expired' }]
    })

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.error).toBe('Rate has expired')
    expect(prismaMock.order.update).not.toHaveBeenCalled()
  })

  it('returns 500 if an unexpected error is thrown', async () => {
    purchaseShippoLabelMock.mockRejectedValue(new Error('network error'))

    const response = await POST(makeRequest({ rateObjectId: 'rate_1' }), baseParams)
    expect(response.status).toBe(500)
  })
})
