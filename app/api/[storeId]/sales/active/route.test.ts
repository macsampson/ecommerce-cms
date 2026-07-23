import { GET } from './route'
import prismadb from '@/lib/prismadb'

const prismaMock = prismadb as any
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

describe('GET /api/[storeId]/sales/active', () => {
  beforeEach(() => jest.resetAllMocks())

  it('returns active sales ordered by best discount first', async () => {
    prismaMock.sale.findMany.mockResolvedValue([{ id: 'sale-1', percentage: 50 }])

    const response = await GET(new Request('http://localhost/x'), baseParams)
    const data = await response.json()

    expect(data).toEqual([{ id: 'sale-1', percentage: 50 }])
    expect(prismaMock.sale.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { percentage: 'desc' } })
    )
  })

  it('returns 400 when storeId is missing', async () => {
    const response = await GET(new Request('http://localhost/x'), { params: Promise.resolve({ storeId: '' }) })
    expect(response.status).toBe(400)
  })

  it('returns 500 on a database error', async () => {
    prismaMock.sale.findMany.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/x'), baseParams)
    expect(response.status).toBe(500)
  })
})
