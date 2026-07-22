import { ShippingSettings } from '@prisma/client'
import { decryptSecret, encryptSecret, maskSecret } from '@/lib/secret-crypto'

/**
 * Shipping provider credentials can come from the per-store admin UI (encrypted
 * at rest, see lib/secret-crypto.ts) or from deploy-time env vars. The DB value
 * wins so an operator can override env vars from the Shipping settings page
 * without a redeploy; the env var remains a working default for instances that
 * never touch the UI. Callers should call these right where the key is used
 * (the actual provider fetch) rather than hoisting the result into a variable
 * that outlives the request.
 */
export function getShippoApiKey(
  settings: Pick<ShippingSettings, 'shippoApiKey'> | null | undefined
): string | undefined {
  const stored = settings?.shippoApiKey ? decryptSecret(settings.shippoApiKey) : undefined
  return stored || process.env.SHIPPO_API_KEY || undefined
}

export function getChitchatsConfig(
  settings:
    | Pick<ShippingSettings, 'chitchatsApiKey' | 'chitchatsApiUrl' | 'chitchatsClientId'>
    | null
    | undefined
): { apiKey?: string; apiUrl?: string; clientId?: string } {
  const storedApiKey = settings?.chitchatsApiKey ? decryptSecret(settings.chitchatsApiKey) : undefined
  return {
    apiKey: storedApiKey || process.env.CHITCHATS_API_KEY || undefined,
    apiUrl: settings?.chitchatsApiUrl || process.env.CHITCHATS_API_URL || undefined,
    clientId: settings?.chitchatsClientId || process.env.CHITCHATS_CLIENT_ID || undefined
  }
}

export const SHIPPING_SECRET_FIELDS = ['shippoApiKey', 'chitchatsApiKey'] as const

/** Encrypts any secret fields present in a PUT payload before it reaches Prisma. */
export function encryptShippingSecretFields<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data }
  for (const field of SHIPPING_SECRET_FIELDS) {
    const value = result[field]
    if (typeof value === 'string' && value.length > 0) {
      ;(result as Record<string, unknown>)[field] = encryptSecret(value)
    }
  }
  return result
}

/**
 * Shapes a ShippingSettings row for API responses: raw/encrypted secret columns
 * are stripped and replaced with a masked preview plus a source flag, so the
 * plaintext key never round-trips to the browser — not even to the admin who
 * entered it.
 */
export function sanitizeShippingSettingsForResponse(settings: ShippingSettings) {
  const { shippoApiKey, chitchatsApiKey, chitchatsApiUrl, chitchatsClientId, ...rest } = settings

  const resolvedShippoKey = getShippoApiKey(settings)
  const chitchatsConfig = getChitchatsConfig(settings)

  return {
    ...rest,
    shippoApiKeyMasked: resolvedShippoKey ? maskSecret(resolvedShippoKey) : null,
    shippoApiKeyFromEnv: !shippoApiKey && Boolean(process.env.SHIPPO_API_KEY),
    chitchatsApiKeyMasked: chitchatsConfig.apiKey ? maskSecret(chitchatsConfig.apiKey) : null,
    chitchatsApiUrlSet: Boolean(chitchatsConfig.apiUrl),
    chitchatsClientIdSet: Boolean(chitchatsConfig.clientId),
    chitchatsFromEnv:
      !chitchatsApiKey &&
      !chitchatsApiUrl &&
      !chitchatsClientId &&
      Boolean(process.env.CHITCHATS_API_KEY)
  }
}
