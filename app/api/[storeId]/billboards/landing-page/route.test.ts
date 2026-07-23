import { GET } from './route'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any

const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/billboards/landing-page', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns the landing-page billboard', async () => {
    prismaMock.billboard.findFirst.mockResolvedValue({ id: 'b1', landingPage: true })

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toEqual({ id: 'b1', landingPage: true })
    expect(prismaMock.billboard.findFirst).toHaveBeenCalledWith({ where: { landingPage: true } })
  })

  it('returns null when no billboard is marked as the landing page', async () => {
    prismaMock.billboard.findFirst.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toBeNull()
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(new Request('http://localhost/x'), {
      params: Promise.resolve({ storeId: '' })
    })
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.billboard.findFirst.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
