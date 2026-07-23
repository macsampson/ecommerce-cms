import { GET } from './route'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

function makeRequest(query: string) {
  return new Request(`http://localhost/x${query}`)
}

describe('GET /api/[storeId]/exchange-rates', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    global.fetch = jest.fn()
  })

  it('returns cached rates from the database when recent', async () => {
    prismaMock.exchangeRate.findUnique.mockResolvedValue({
      baseCurrency: 'USD',
      rates: { CAD: 1.38 },
      updatedAt: new Date()
    })

    const response = await GET(makeRequest('?base=USD'), baseParams)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.rates).toEqual({ CAD: 1.38 })
    expect(data.cached).toBe(true)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects a malformed base currency code', async () => {
    const response = await GET(makeRequest('?base=usd1'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('fetches fresh rates from the external API when there is no cached entry', async () => {
    prismaMock.exchangeRate.findUnique.mockResolvedValue(null)
    prismaMock.exchangeRate.upsert.mockResolvedValue({})
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ conversion_rates: { CAD: 1.4 } })
    })

    const response = await GET(makeRequest('?base=USD'), baseParams)
    const data = await response.json()

    expect(data.rates).toEqual({ CAD: 1.4 })
    expect(prismaMock.exchangeRate.upsert).toHaveBeenCalled()
  })

  it('falls back to static default rates when the external API call fails', async () => {
    prismaMock.exchangeRate.findUnique.mockResolvedValue(null)
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 })

    const response = await GET(makeRequest('?base=USD'), baseParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rates).toEqual({ USD: 1, CAD: 1.38, AUD: 1.5 })
  })

  it('defaults to USD when no base currency is specified', async () => {
    prismaMock.exchangeRate.findUnique.mockResolvedValue({
      baseCurrency: 'USD',
      rates: { CAD: 1.38 },
      updatedAt: new Date()
    })

    const response = await GET(makeRequest(''), baseParams)
    const data = await response.json()

    expect(data.base).toBe('USD')
  })
})
