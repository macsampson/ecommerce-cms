import { POST } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

function makeRequest(body: any) {
  return new Request('http://localhost/api/stores', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/stores', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
  })

  it('creates a store for the single admin user', async () => {
    prismaMock.store.create.mockResolvedValue({ id: 'store-1', name: 'My Store', userId: 'single-user' })

    const response = await POST(makeRequest({ name: 'My Store' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('My Store')
    expect(prismaMock.store.create).toHaveBeenCalledWith({
      data: { name: 'My Store', userId: 'single-user' }
    })
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(false)

    const response = await POST(makeRequest({ name: 'My Store' }))
    expect(response.status).toBe(401)
    expect(prismaMock.store.create).not.toHaveBeenCalled()
  })

  it('returns 400 when name is missing', async () => {
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.store.create.mockRejectedValue(new Error('db down'))

    const response = await POST(makeRequest({ name: 'My Store' }))
    expect(response.status).toBe(500)
  })
})
