import { POST } from './route'
import { login } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

jest.mock('@/lib/auth', () => ({
  login: jest.fn()
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(() => '127.0.0.1')
}))

const loginMock = login as jest.Mock
const rateLimitMock = rateLimit as jest.Mock

function makeRequest(body: any) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rateLimitMock.mockReturnValue({ allowed: true })
  })

  it('returns success when credentials are valid', async () => {
    loginMock.mockResolvedValue(true)

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'pw' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
  })

  it('returns 401 for invalid credentials', async () => {
    loginMock.mockResolvedValue(false)

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'wrong' }))

    expect(response.status).toBe(401)
  })

  it('returns 400 when email or password is missing', async () => {
    const response = await POST(makeRequest({ email: 'a@b.com' }))
    expect(response.status).toBe(400)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the login rate limit is exceeded', async () => {
    rateLimitMock.mockReturnValue({ allowed: false })

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'pw' }))

    expect(response.status).toBe(429)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('returns 500 if login throws', async () => {
    loginMock.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'pw' }))

    expect(response.status).toBe(500)
  })
})
