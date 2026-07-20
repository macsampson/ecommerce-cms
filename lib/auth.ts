import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export interface SessionData {
  isAuthenticated: boolean
  createdAt: number
}

export const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long',
  cookieName: 'cms_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)

  // Set default session values
  if (!session.isAuthenticated) {
    session.isAuthenticated = false
  }

  return session
}

export async function login(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    console.error('Admin credentials not configured')
    return false
  }

  // Check email
  if (email !== adminEmail) {
    return false
  }

  // Check password
  const isValid = await bcrypt.compare(password, adminPasswordHash)

  if (isValid) {
    const session = await getSession()
    session.isAuthenticated = true
    session.createdAt = Date.now()
    await session.save()
    return true
  }

  return false
}

export async function logout() {
  const session = await getSession()
  session.destroy()
}

// Utility function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
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
