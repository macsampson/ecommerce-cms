import { POST } from './route'
import { isAuthenticated } from '@/lib/auth'
import { handleUpload } from '@vercel/blob/client'

jest.mock('@/lib/auth')
jest.mock('@vercel/blob/client', () => ({
  handleUpload: jest.fn()
}))

const authMock = isAuthenticated as jest.Mock
const handleUploadMock = handleUpload as jest.Mock

function makeRequest(body: any) {
  return new Request('http://localhost/api/upload', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/upload', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns the token payload from handleUpload on success', async () => {
    authMock.mockResolvedValue(true)
    handleUploadMock.mockResolvedValue({ type: 'blob.generate-client-token', clientToken: 'tok_123' })

    const response = await POST(makeRequest({ type: 'blob.generate-client-token' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ type: 'blob.generate-client-token', clientToken: 'tok_123' })
  })

  it('returns 401 when unauthenticated, without calling handleUpload', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest({}))

    expect(response.status).toBe(401)
    expect(handleUploadMock).not.toHaveBeenCalled()
  })

  it('returns 400 with the error message when handleUpload throws', async () => {
    authMock.mockResolvedValue(true)
    handleUploadMock.mockRejectedValue(new Error('invalid content type'))

    const response = await POST(makeRequest({}))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('invalid content type')
  })
})
