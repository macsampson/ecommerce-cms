import { isEncryptionConfigured, encryptSecret, decryptSecret, maskSecret } from './secret-crypto'

describe('secret-crypto', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, SECRETS_ENCRYPTION_KEY: 'test-encryption-key-32-characters' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('isEncryptionConfigured', () => {
    it('is true when SECRETS_ENCRYPTION_KEY is set', () => {
      expect(isEncryptionConfigured()).toBe(true)
    })

    it('is false when SECRETS_ENCRYPTION_KEY is unset', () => {
      delete process.env.SECRETS_ENCRYPTION_KEY
      expect(isEncryptionConfigured()).toBe(false)
    })
  })

  describe('encryptSecret / decryptSecret', () => {
    it('round-trips a plaintext secret', () => {
      const encrypted = encryptSecret('shpk_live_abc123xyz')
      expect(encrypted).not.toBe('shpk_live_abc123xyz')

      const decrypted = decryptSecret(encrypted)
      expect(decrypted).toBe('shpk_live_abc123xyz')
    })

    it('produces different ciphertext each time (random IV)', () => {
      const a = encryptSecret('same-plaintext')
      const b = encryptSecret('same-plaintext')

      expect(a).not.toBe(b)
    })

    it('throws when encrypting without SECRETS_ENCRYPTION_KEY configured', () => {
      delete process.env.SECRETS_ENCRYPTION_KEY
      expect(() => encryptSecret('secret')).toThrow(/SECRETS_ENCRYPTION_KEY/)
    })

    it('returns undefined (not throw) for corrupt ciphertext', () => {
      expect(decryptSecret('not-valid-base64-ciphertext')).toBeUndefined()
    })

    it('returns undefined for ciphertext encrypted under a different key', () => {
      const encrypted = encryptSecret('secret')
      process.env.SECRETS_ENCRYPTION_KEY = 'a-completely-different-key-value'

      expect(decryptSecret(encrypted)).toBeUndefined()
    })
  })

  describe('maskSecret', () => {
    it('shows only the last 4 characters', () => {
      expect(maskSecret('shpk_live_abc123xyz')).toBe('••••••••3xyz')
    })

    it('handles short secrets shorter than 4 characters', () => {
      expect(maskSecret('ab')).toBe('••••••••ab')
    })
  })
})
