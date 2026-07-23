import { createShippoShipment, purchaseShippoLabel, flattenShippoError } from './shippo'

describe('flattenShippoError', () => {
  it('flattens a nested validation error object into a readable string', () => {
    const raw = { address_from: { zip: ['This field is required.'] } }

    expect(flattenShippoError(raw)).toBe('address_from.zip: This field is required.')
  })

  it('joins multiple messages with a semicolon', () => {
    const raw = {
      address_from: { zip: ['Required.'] },
      address_to: { city: ['Required.'] }
    }

    expect(flattenShippoError(raw)).toBe('address_from.zip: Required.; address_to.city: Required.')
  })

  it('handles a plain string at the root', () => {
    expect(flattenShippoError('Something went wrong')).toBe('Something went wrong')
  })

  it('returns an empty string for null/undefined/empty input', () => {
    expect(flattenShippoError(null)).toBe('')
    expect(flattenShippoError(undefined)).toBe('')
    expect(flattenShippoError({})).toBe('')
  })

  it('flattens an array of error strings', () => {
    expect(flattenShippoError(['first error', 'second error'])).toBe('first error; second error')
  })
})

describe('createShippoShipment', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  const baseParams = {
    apiKey: 'shpk_test',
    addressFrom: { name: 'A', street1: '1 St', city: 'C', state: 'S', zip: '00000', country: 'US' },
    addressTo: { name: 'B', street1: '2 St', city: 'C', state: 'S', zip: '00000', country: 'US' },
    parcel: { length: '1', width: '1', height: '1', distance_unit: 'cm', weight: '1', weight_unit: 'g', mass_unit: 'g' }
  }

  it('returns rates and messages on a successful response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ rates: [{ object_id: 'r1' }], messages: [], status: 'SUCCESS' })
    })

    const result = await createShippoShipment(baseParams)

    expect(result.httpOk).toBe(true)
    expect(result.rates).toEqual([{ object_id: 'r1' }])
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.goshippo.com/shipments/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'ShippoToken shpk_test' })
      })
    )
  })

  it('defaults rates and messages to empty arrays when absent from the response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ address_from: { zip: ['required'] } })
    })

    const result = await createShippoShipment(baseParams)

    expect(result.rates).toEqual([])
    expect(result.messages).toEqual([])
    expect(result.httpOk).toBe(false)
    expect(result.raw).toEqual({ address_from: { zip: ['required'] } })
  })
})

describe('purchaseShippoLabel', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('returns the transaction from a successful purchase', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ object_id: 'txn_1', status: 'SUCCESS', label_url: 'https://x/label.pdf' })
    })

    const result = await purchaseShippoLabel({ apiKey: 'shpk_test', rate: 'rate_1' })

    expect(result.status).toBe('SUCCESS')
    expect(result.label_url).toBe('https://x/label.pdf')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.goshippo.com/transactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ rate: 'rate_1', label_file_type: 'PDF', async: false })
      })
    )
  })

  it('surfaces an ERROR status transaction as-is (caller decides how to handle it)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ object_id: 'txn_1', status: 'ERROR', messages: [{ text: 'Invalid rate' }] })
    })

    const result = await purchaseShippoLabel({ apiKey: 'shpk_test', rate: 'rate_1' })

    expect(result.status).toBe('ERROR')
    expect(result.messages).toEqual([{ text: 'Invalid rate' }])
  })
})
