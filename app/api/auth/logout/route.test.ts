import { POST } from './route'
import { logout } from '@/lib/auth'

jest.mock('@/lib/auth', () => ({
  logout: jest.fn()
}))

const logoutMock = logout as jest.Mock

describe('POST /api/auth/logout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('destroys the session and returns success', async () => {
    logoutMock.mockResolvedValue(undefined)

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
  })

  it('returns 500 if logout throws', async () => {
    logoutMock.mockRejectedValue(new Error('session store down'))

    const response = await POST()

    expect(response.status).toBe(500)
  })
})
