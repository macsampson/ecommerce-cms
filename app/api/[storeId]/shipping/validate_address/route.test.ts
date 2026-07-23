import { POST } from './route'
import axios from 'axios'

jest.mock('axios')

const axiosMock = axios as jest.Mocked<typeof axios>

function makeRequest(body: any) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

const validAddress = {
  firstName: 'Jane',
  lastName: 'Doe',
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  country: 'US'
}

describe('POST /api/[storeId]/shipping/validate_address', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns isValid=true with no suggested address when Shippo confirms it as valid', async () => {
    axiosMock.get.mockResolvedValue({
      data: { analysis: { validation_result: { value: 'valid' } } }
    })

    const response = await POST(makeRequest(validAddress))
    const data = await response.json()

    expect(data).toEqual({ isValid: true })
  })

  it('returns isValid=false when Shippo flags it as invalid', async () => {
    axiosMock.get.mockResolvedValue({
      data: { analysis: { validation_result: { value: 'invalid' } } }
    })

    const response = await POST(makeRequest(validAddress))
    const data = await response.json()

    expect(data.isValid).toBe(false)
  })

  it('includes a suggested address when Shippo recommends a correction', async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        analysis: { validation_result: { value: 'valid' } },
        recommended_address: {
          name: 'Jane Doe',
          address_line_1: '123 Main Street',
          address_line_2: '',
          city_locality: 'Springfield',
          state_province: 'IL',
          postal_code: '62701-1234',
          country_code: 'US',
          confidence_result: { score: 'high', code: 'A1', description: 'Confirmed' }
        }
      }
    })

    const response = await POST(makeRequest(validAddress))
    const data = await response.json()

    expect(data.suggestedAddress).toEqual({
      name: 'Jane Doe',
      street: '123 Main Street',
      apartment: '',
      city: 'Springfield',
      state: 'IL',
      zip: '62701-1234',
      country: 'US'
    })
  })

  it('returns isValid=false when the Shippo request fails, without throwing', async () => {
    axiosMock.get.mockRejectedValue(new Error('network error'))

    const response = await POST(makeRequest(validAddress))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ isValid: false })
  })

  it('returns 500 if the request body cannot be parsed', async () => {
    const response = await POST(new Request('http://localhost/x', { method: 'POST', body: 'not json' }))
    expect(response.status).toBe(500)
  })
})
