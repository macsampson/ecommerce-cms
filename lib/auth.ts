import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { isDemoModeEnabled } from '@/lib/demo-mode'
import prismadb from '@/lib/prismadb'

export interface SessionData {
  isAuthenticated: boolean
  createdAt: number
}

// Resolved once per warm serverless instance. Priority: SESSION_SECRET env var
// (for operators who set one explicitly) > the secret generated for the
// database-backed admin account created via /setup > a legacy hardcoded
// fallback, which should only ever be reachable for an env-var-configured
// admin that predates this file (see login() below).
let cachedSessionSecret: string | null = null

async function resolveSessionSecret(): Promise<string> {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  if (cachedSessionSecret) return cachedSessionSecret

  const admin = await prismadb.adminUser.findFirst()
  cachedSessionSecret =
    admin?.sessionSecret || 'complex_password_at_least_32_characters_long'
  return cachedSessionSecret
}

async function getSessionOptions() {
  return {
    password: await resolveSessionSecret(),
    cookieName: 'cms_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  }
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), await getSessionOptions())

  // Set default session values
  if (!session.isAuthenticated) {
    session.isAuthenticated = false
  }

  return session
}

// Whether an admin account exists yet, via either the database (created
// through the first-run /setup flow) or the legacy env-var configuration.
export async function isAdminConfigured(): Promise<boolean> {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) return true
  const admin = await prismadb.adminUser.findFirst()
  return admin !== null
}

// Creates the single admin account. Only callable once — rejects if an admin
// is already configured (database or env vars), so /setup can't be replayed
// to take over an existing deployment.
export async function createAdminAccount(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (await isAdminConfigured()) {
    return { success: false, error: 'An admin account is already configured' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const sessionSecret = crypto.randomBytes(32).toString('hex')

  await prismadb.adminUser.create({
    data: { email, passwordHash, sessionSecret }
  })
  cachedSessionSecret = sessionSecret

  return { success: true }
}

export async function login(email: string, password: string): Promise<boolean> {
  const admin = await prismadb.adminUser.findFirst()

  if (admin) {
    if (email !== admin.email) return false
    const isValid = await bcrypt.compare(password, admin.passwordHash)
    if (!isValid) return false
  } else {
    // Legacy env-var-configured admin (no database row from /setup).
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminEmail || !adminPasswordHash) {
      logger.error('Admin credentials not configured')
      return false
    }

    if (email !== adminEmail) return false
    const isValid = await bcrypt.compare(password, adminPasswordHash)
    if (!isValid) return false
  }

  const session = await getSession()
  session.isAuthenticated = true
  session.createdAt = Date.now()
  await session.save()
  return true
}

export async function logout() {
  const session = await getSession()
  session.destroy()
}

// Utility function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  // The public demo publishes its own credentials in the README, so the login
  // gate adds friction without adding security — writes are independently
  // blocked in demo mode regardless of auth state (see lib/demo-mode.ts).
  if (isDemoModeEnabled()) return true

  // Skip the login gate for local development so the dashboard is reachable
  // without needing the admin password. This is an explicit opt-in (rather
  // than keying off NODE_ENV) so a misconfigured or non-Vercel deployment
  // fails closed — auth is enforced unless this is deliberately set, never
  // because some other env var was left unset.
  if (process.env.DISABLE_AUTH_FOR_LOCAL_DEV === 'true') return true

  const session = await getSession()
  return session.isAuthenticated || false
}

// This app is single-admin, so there's no real user table to look up —
// callers that expect a userId (carried over from a prior multi-tenant auth setup) get a fixed one.
export function auth() {
  return { userId: 'single-user' }
}

// Utility to generate password hash for initial setup
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
