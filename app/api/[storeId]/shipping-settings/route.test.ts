import { GET, PUT } from './route'
import prismadb from '@/lib/prismadb'
import { isEncryptionConfigured } from '@/lib/secret-crypto'

jest.mock('@/lib/secret-crypto', () => ({
  isEncryptionConfigured: jest.fn(() => true),
  encryptSecret: jest.fn((v: string) => `encrypted:${v}`),
  decryptSecret: jest.fn((v: string) => v.replace('encrypted:', '')),
  maskSecret: jest.fn((v: string) => `masked:${v.slice(-4)}`)
}))

const prismaMock = prismadb as any
const isEncryptionConfiguredMock = isEncryptionConfigured as jest.Mock
const baseParams = { params: Promise.resolve({ storeId: 'store-1' }) }

function makeRequest(body?: any) {
  return new Request('http://localhost/x', {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

describe('GET /api/[storeId]/shipping-settings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns null when no settings exist yet', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/x') as any, baseParams)
    const data = await response.json()

    expect(data).toBeNull()
  })

  it('returns sanitized settings (no raw secret fields) when they exist', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({
      storeId: 'store-1',
      name: 'Acme',
      shippoApiKey: 'encrypted:shpk_live_abc123',
      chitchatsApiKey: null,
      chitchatsApiUrl: null,
      chitchatsClientId: null
    })

    const response = await GET(new Request('http://localhost/x') as any, baseParams)
    const data = await response.json()

    expect(data.shippoApiKey).toBeUndefined()
    expect(data.shippoApiKeyMasked).toBe('masked:c123')
    expect(data.name).toBe('Acme')
  })
})

describe('PUT /api/[storeId]/shipping-settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isEncryptionConfiguredMock.mockReturnValue(true)
  })

  it('updates existing settings', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({ storeId: 'store-1', name: 'Old' })
    prismaMock.shippingSettings.update.mockResolvedValue({ storeId: 'store-1', name: 'New' })

    const response = await PUT(makeRequest({ name: 'New' }) as any, baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.shippingSettings.update).toHaveBeenCalledWith({
      where: { storeId: 'store-1' },
      data: { name: 'New' }
    })
  })

  it('creates settings when none exist yet', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue(null)
    prismaMock.shippingSettings.create.mockResolvedValue({ storeId: 'store-1', name: 'Acme' })

    const response = await PUT(makeRequest({ name: 'Acme' }) as any, baseParams)

    expect(response.status).toBe(200)
    expect(prismaMock.shippingSettings.create).toHaveBeenCalled()
  })

  it('only persists whitelisted fields, dropping unknown ones', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({ storeId: 'store-1' })
    prismaMock.shippingSettings.update.mockResolvedValue({ storeId: 'store-1' })

    await PUT(makeRequest({ name: 'Acme', id: 'should-be-dropped', createdAt: 'nope' }) as any, baseParams)

    expect(prismaMock.shippingSettings.update).toHaveBeenCalledWith({
      where: { storeId: 'store-1' },
      data: { name: 'Acme' }
    })
  })

  it('encrypts secret fields before persisting them', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue({ storeId: 'store-1' })
    prismaMock.shippingSettings.update.mockResolvedValue({ storeId: 'store-1' })

    await PUT(makeRequest({ shippoApiKey: 'shpk_live_abc123' }) as any, baseParams)

    expect(prismaMock.shippingSettings.update).toHaveBeenCalledWith({
      where: { storeId: 'store-1' },
      data: { shippoApiKey: 'encrypted:shpk_live_abc123' }
    })
  })

  it('returns 500 when a secret field is submitted but encryption is not configured', async () => {
    isEncryptionConfiguredMock.mockReturnValue(false)

    const response = await PUT(makeRequest({ shippoApiKey: 'shpk_live_abc123' }) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toMatch(/SECRETS_ENCRYPTION_KEY/)
  })

  it('returns 400 when creating settings fails due to missing required address fields', async () => {
    prismaMock.shippingSettings.findUnique.mockResolvedValue(null)
    prismaMock.shippingSettings.create.mockRejectedValue(new Error('required field missing'))

    const response = await PUT(makeRequest({ shippoApiKey: 'shpk_live_abc123' }) as any, baseParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/sender address/)
  })

  it('returns 500 on an unexpected database error', async () => {
    prismaMock.shippingSettings.findUnique.mockRejectedValue(new Error('db down'))

    const response = await PUT(makeRequest({ name: 'Acme' }) as any, baseParams)
    expect(response.status).toBe(500)
  })
})
