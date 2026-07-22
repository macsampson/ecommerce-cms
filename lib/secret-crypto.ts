import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * At-rest encryption for secrets stored in the database (e.g. shipping provider
 * API keys entered through the admin UI). The key must live outside the database —
 * storing it alongside the ciphertext (like adminUser.sessionSecret does today)
 * would defeat the point, so this intentionally has no DB-backed fallback.
 */
export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.SECRETS_ENCRYPTION_KEY)
}

function getKey(): Buffer {
  const secret = process.env.SECRETS_ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      'SECRETS_ENCRYPTION_KEY is not set — cannot encrypt or decrypt stored secrets.'
    )
  }
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

/** Returns undefined (rather than throwing) on a missing key or corrupt/foreign ciphertext. */
export function decryptSecret(encoded: string): string | undefined {
  try {
    const key = getKey()
    const raw = Buffer.from(encoded, 'base64')
    const iv = raw.subarray(0, IV_LENGTH)
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return plaintext.toString('utf8')
  } catch {
    return undefined
  }
}

/** e.g. "shpk_live_abc123xyz" -> "••••••••xyz" — never reveals more than the last 4 chars. */
export function maskSecret(plaintext: string): string {
  const visible = plaintext.slice(-4)
  return `${'•'.repeat(8)}${visible}`
}
