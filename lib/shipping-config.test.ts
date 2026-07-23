import {
  getShippoApiKey,
  getChitchatsConfig,
  encryptShippingSecretFields,
  sanitizeShippingSettingsForResponse
} from './shipping-config'
import { encryptSecret } from './secret-crypto'

describe('shipping-config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, SECRETS_ENCRYPTION_KEY: 'test-encryption-key-32-characters' }
    delete process.env.SHIPPO_API_KEY
    delete process.env.CHITCHATS_API_KEY
    delete process.env.CHITCHATS_API_URL
    delete process.env.CHITCHATS_CLIENT_ID
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getShippoApiKey', () => {
    it('prefers a decrypted stored key over the env var', () => {
      process.env.SHIPPO_API_KEY = 'env-key'
      const stored = encryptSecret('stored-key')

      expect(getShippoApiKey({ shippoApiKey: stored })).toBe('stored-key')
    })

    it('falls back to the env var when no stored key is set', () => {
      process.env.SHIPPO_API_KEY = 'env-key'

      expect(getShippoApiKey({ shippoApiKey: null })).toBe('env-key')
    })

    it('returns undefined when neither is configured', () => {
      expect(getShippoApiKey(null)).toBeUndefined()
    })
  })

  describe('getChitchatsConfig', () => {
    it('prefers stored values over env vars for each field independently', () => {
      process.env.CHITCHATS_API_URL = 'https://env.example.com'
      const storedKey = encryptSecret('stored-chitchats-key')

      const result = getChitchatsConfig({
        chitchatsApiKey: storedKey,
        chitchatsApiUrl: null,
        chitchatsClientId: 'stored-client-id'
      })

      expect(result).toEqual({
        apiKey: 'stored-chitchats-key',
        apiUrl: 'https://env.example.com',
        clientId: 'stored-client-id'
      })
    })
  })

  describe('encryptShippingSecretFields', () => {
    it('encrypts secret fields present in the payload', () => {
      const result = encryptShippingSecretFields({ shippoApiKey: 'plain-key', name: 'Acme' })

      expect(result.shippoApiKey).not.toBe('plain-key')
      expect(result.name).toBe('Acme')
    })

    it('leaves non-secret fields and absent secret fields untouched', () => {
      const result = encryptShippingSecretFields({ name: 'Acme' })

      expect(result).toEqual({ name: 'Acme' })
    })

    it('does not encrypt an empty-string secret value', () => {
      const result = encryptShippingSecretFields({ shippoApiKey: '' })

      expect(result.shippoApiKey).toBe('')
    })
  })

  describe('sanitizeShippingSettingsForResponse', () => {
    it('strips raw secret fields and replaces them with masked previews', () => {
      const settings: any = {
        storeId: 'store-1',
        name: 'Acme',
        shippoApiKey: encryptSecret('shpk_live_abc123'),
        chitchatsApiKey: null,
        chitchatsApiUrl: null,
        chitchatsClientId: null
      }

      const result = sanitizeShippingSettingsForResponse(settings)

      expect(result).not.toHaveProperty('shippoApiKey')
      expect(result).not.toHaveProperty('chitchatsApiKey')
      expect(result.shippoApiKeyMasked).toMatch(/123$/)
      expect(result.shippoApiKeyFromEnv).toBe(false)
    })

    it('flags shippoApiKeyFromEnv when no DB key is stored but an env var is', () => {
      process.env.SHIPPO_API_KEY = 'env-key'
      const settings: any = {
        storeId: 'store-1',
        shippoApiKey: null,
        chitchatsApiKey: null,
        chitchatsApiUrl: null,
        chitchatsClientId: null
      }

      const result = sanitizeShippingSettingsForResponse(settings)

      expect(result.shippoApiKeyFromEnv).toBe(true)
      expect(result.shippoApiKeyMasked).toMatch(/key$/)
    })
  })
})
