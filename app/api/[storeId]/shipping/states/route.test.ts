import { GET } from './route'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

function makeRequest(query: string) {
  return new Request(`http://localhost/x${query}`)
}

describe('GET /api/[storeId]/shipping/states', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock))
  })

  it('returns states for the given country code, with BigInt ids stringified', async () => {
    prismaMock.state.findMany.mockResolvedValue([
      { id: BigInt(5), name: 'California', type: 'state', iso2: 'CA', fipsCode: '06' }
    ])

    const response = await GET(makeRequest('?countryCode=US'), baseParams)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.states).toEqual([
      { id: '5', name: 'California', type: 'state', iso2: 'CA', fipsCode: '06' }
    ])
    expect(prismaMock.state.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { countryCode: 'US', flag: 1 } })
    )
  })

  it('returns 400 when countryCode is missing', async () => {
    const response = await GET(makeRequest(''), baseParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.state.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(makeRequest('?countryCode=US'), baseParams)
    expect(response.status).toBe(500)
  })
})
