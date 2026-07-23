import { PATCH, DELETE } from './route'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

jest.mock('@/lib/auth')

const prismaMock = prismadb as any
const authMock = isAuthenticated as jest.Mock

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

function makeRequest(body?: any) {
  return new Request('http://localhost/api/stores/store-1', {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('PATCH /api/stores/[storeId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
  })

  it('updates the store name for the single admin user', async () => {
    prismaMock.store.updateMany.mockResolvedValue({ count: 1 })

    const response = await PATCH(makeRequest({ name: 'New Name' }), baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.store.updateMany).toHaveBeenCalledWith({
      where: { id: 'store-1', userId: 'single-user' },
      data: { name: 'New Name' }
    })
  })

  it('returns 401 when unauthenticated ("Unauthenticated")', async () => {
    authMock.mockResolvedValue(false)

    const response = await PATCH(makeRequest({ name: 'New Name' }), baseParams)
    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthenticated')
  })

  it('returns 400 when name is missing', async () => {
    const response = await PATCH(makeRequest({}), baseParams)
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.store.updateMany.mockRejectedValue(new Error('db down'))

    const response = await PATCH(makeRequest({ name: 'New Name' }), baseParams)
    expect(response.status).toBe(500)
  })
})

describe('DELETE /api/stores/[storeId]', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    authMock.mockResolvedValue(true)
  })

  it('deletes the store for the single admin user', async () => {
    prismaMock.store.deleteMany.mockResolvedValue({ count: 1 })

    const response = await DELETE(makeRequest(), baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.store.deleteMany).toHaveBeenCalledWith({
      where: { id: 'store-1', userId: 'single-user' }
    })
  })

  it('returns 401 when unauthenticated ("Unauthenticated", matching PATCH)', async () => {
    authMock.mockResolvedValue(false)

    const response = await DELETE(makeRequest(), baseParams)
    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthenticated')
  })

  it('returns 500 on a database error', async () => {
    prismaMock.store.deleteMany.mockRejectedValue(new Error('db down'))

    const response = await DELETE(makeRequest(), baseParams)
    expect(response.status).toBe(500)
  })
})
