import { GET, POST } from './route'
import { createAdminAccount, login, isAdminConfigured } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

jest.mock('@/lib/auth', () => ({
  createAdminAccount: jest.fn(),
  login: jest.fn(),
  isAdminConfigured: jest.fn()
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(() => '127.0.0.1')
}))

const createAdminAccountMock = createAdminAccount as jest.Mock
const loginMock = login as jest.Mock
const isAdminConfiguredMock = isAdminConfigured as jest.Mock
const rateLimitMock = rateLimit as jest.Mock

function makeRequest(body: any) {
  return new Request('http://localhost/api/auth/setup', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

describe('GET /api/auth/setup', () => {
  it('reports whether an admin is already configured', async () => {
    isAdminConfiguredMock.mockResolvedValue(true)

    const response = await GET()
    const data = await response.json()

    expect(data).toEqual({ configured: true })
  })
})

describe('POST /api/auth/setup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rateLimitMock.mockReturnValue({ allowed: true })
  })

  it('creates the admin account and logs in on first run', async () => {
    createAdminAccountMock.mockResolvedValue({ success: true })
    loginMock.mockResolvedValue(true)

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(loginMock).toHaveBeenCalledWith('a@b.com', 'longenough')
  })

  it('returns 409 when an admin is already configured', async () => {
    createAdminAccountMock.mockResolvedValue({
      success: false,
      error: 'An admin account is already configured'
    })

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }))

    expect(response.status).toBe(409)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('returns 400 when email or password is missing', async () => {
    const response = await POST(makeRequest({ email: 'a@b.com' }))
    expect(response.status).toBe(400)
    expect(createAdminAccountMock).not.toHaveBeenCalled()
  })

  it('returns 400 when password is shorter than 8 characters', async () => {
    const response = await POST(makeRequest({ email: 'a@b.com', password: 'short' }))
    expect(response.status).toBe(400)
    expect(createAdminAccountMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the rate limit is exceeded', async () => {
    rateLimitMock.mockReturnValue({ allowed: false })

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }))

    expect(response.status).toBe(429)
    expect(createAdminAccountMock).not.toHaveBeenCalled()
  })

  it('returns 500 if account creation throws', async () => {
    createAdminAccountMock.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }))

    expect(response.status).toBe(500)
  })
})
