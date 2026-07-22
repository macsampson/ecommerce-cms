import prismadb from '@/lib/prismadb'
import { isDemoModeEnabled } from '@/lib/demo-mode'

export interface ConfigWarning {
  key: string
  message: string
}

/**
 * Surfaces operator-visible config gaps that fail silently otherwise: middleware
 * falls back to a placeholder CORS origin, auth falls back to a hardcoded session
 * secret, and Stripe/Cloudinary just throw wherever they're first used. Node-only
 * (queries the database) — don't import this into middleware.ts, see lib/demo-mode.ts.
 */
export async function getConfigWarnings(): Promise<ConfigWarning[]> {
  if (isDemoModeEnabled() || process.env.DISABLE_AUTH_FOR_LOCAL_DEV === 'true') {
    return []
  }

  const warnings: ConfigWarning[] = []

  if (!process.env.ALLOWED_ORIGINS) {
    warnings.push({
      key: 'ALLOWED_ORIGINS',
      message:
        'ALLOWED_ORIGINS is not set — CORS is falling back to a placeholder domain, so your storefront will get blocked requests to the store-scoped API.'
    })
  }

  if (!process.env.SESSION_SECRET) {
    const admin = await prismadb.adminUser.findFirst()
    if (!admin?.sessionSecret) {
      warnings.push({
        key: 'SESSION_SECRET',
        message:
          'No SESSION_SECRET is set and no admin account has generated one yet — sessions are being signed with a hardcoded fallback secret. Finish /setup, or set SESSION_SECRET yourself.'
      })
    }
  }

  if (!process.env.STRIPE_API_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push({
      key: 'STRIPE',
      message: 'Stripe is not configured — checkout will fail. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET.'
    })
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    warnings.push({
      key: 'CLOUDINARY',
      message: 'Cloudinary is not configured — image uploads will fail. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.'
    })
  }

  return warnings
}
