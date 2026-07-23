// lib/auth.ts is globally mocked in jest.setup.ts for every other test file (so
// routes can just stub isAuthenticated/auth). Here we test the real
// implementation, so we must undo that mock first.
jest.unmock('@/lib/auth')

import bcrypt from 'bcryptjs'
import { getIronSession } from 'iron-session'
import prismadb from '@/lib/prismadb'
import { isDemoModeEnabled } from '@/lib/demo-mode'
import {
  isAuthenticated,
  login,
  logout,
  isAdminConfigured,
  createAdminAccount,
  hashPassword
} from './auth'

jest.mock('iron-session', () => ({ getIronSession: jest.fn() }))
jest.mock('next/headers', () => ({ cookies: jest.fn(() => ({})) }))
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }))
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'generated-secret-hex') }))
}))
jest.mock('@/lib/demo-mode', () => ({ isDemoModeEnabled: jest.fn(() => false) }))
jest.mock('@/lib/logger', () => ({ logger: { error: jest.fn(), info: jest.fn() } }))

const prismaMock = prismadb as any
const getIronSessionMock = getIronSession as jest.Mock
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>
const isDemoModeEnabledMock = isDemoModeEnabled as jest.Mock

function makeSession(overrides: Partial<{ isAuthenticated: boolean }> = {}) {
  return {
    isAuthenticated: overrides.isAuthenticated ?? false,
    createdAt: 0,
    save: jest.fn(),
    destroy: jest.fn()
  }
}

describe('lib/auth', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, SESSION_SECRET: 'test-session-secret-32-characters' }
    isDemoModeEnabledMock.mockReturnValue(false)
    delete process.env.DISABLE_AUTH_FOR_LOCAL_DEV
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('isAuthenticated', () => {
    it('returns true unconditionally in demo mode, without checking the session', async () => {
      isDemoModeEnabledMock.mockReturnValue(true)

      const result = await isAuthenticated()

      expect(result).toBe(true)
      expect(getIronSessionMock).not.toHaveBeenCalled()
    })

    it('returns true unconditionally when DISABLE_AUTH_FOR_LOCAL_DEV is set', async () => {
      process.env.DISABLE_AUTH_FOR_LOCAL_DEV = 'true'

      const result = await isAuthenticated()

      expect(result).toBe(true)
      expect(getIronSessionMock).not.toHaveBeenCalled()
    })

    it('does not bypass auth for other truthy-looking values of DISABLE_AUTH_FOR_LOCAL_DEV', async () => {
      process.env.DISABLE_AUTH_FOR_LOCAL_DEV = 'yes'
      getIronSessionMock.mockResolvedValue(makeSession({ isAuthenticated: false }))

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })

    it('reflects the session isAuthenticated flag outside demo/dev-bypass modes', async () => {
      getIronSessionMock.mockResolvedValue(makeSession({ isAuthenticated: true }))

      expect(await isAuthenticated()).toBe(true)

      getIronSessionMock.mockResolvedValue(makeSession({ isAuthenticated: false }))

      expect(await isAuthenticated()).toBe(false)
    })
  })

  describe('login', () => {
    it('succeeds for a database-backed admin with a matching password and starts a session', async () => {
      prismaMock.adminUser.findFirst.mockResolvedValue({
        email: 'admin@example.com',
        passwordHash: 'hashed'
      })
      bcryptMock.compare.mockResolvedValue(true as never)
      const session = makeSession()
      getIronSessionMock.mockResolvedValue(session)

      const result = await login('admin@example.com', 'correct-password')

      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed')
      expect(session.isAuthenticated).toBe(true)
      expect(session.save).toHaveBeenCalled()
    })

    it('fails when the email does not match the configured admin', async () => {
      prismaMock.adminUser.findFirst.mockResolvedValue({
        email: 'admin@example.com',
        passwordHash: 'hashed'
      })

      const result = await login('someone-else@example.com', 'whatever')

      expect(result).toBe(false)
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('fails when the password does not match', async () => {
      prismaMock.adminUser.findFirst.mockResolvedValue({
        email: 'admin@example.com',
        passwordHash: 'hashed'
      })
      bcryptMock.compare.mockResolvedValue(false as never)

      const result = await login('admin@example.com', 'wrong-password')

      expect(result).toBe(false)
    })

    it('falls back to legacy env-var admin credentials when no database admin exists', async () => {
      prismaMock.adminUser.findFirst.mockResolvedValue(null)
      process.env.ADMIN_EMAIL = 'legacy@example.com'
      process.env.ADMIN_PASSWORD_HASH = 'legacy-hash'
      bcryptMock.compare.mockResolvedValue(true as never)
      const session = makeSession()
      getIronSessionMock.mockResolvedValue(session)

      const result = await login('legacy@example.com', 'legacy-password')

      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith('legacy-password', 'legacy-hash')
    })

    it('fails when there is no database admin and no legacy env credentials configured', async () => {
      prismaMock.adminUser.findFirst.mockResolvedValue(null)
      delete process.env.ADMIN_EMAIL
      delete process.env.ADMIN_PASSWORD_HASH

      const result = await login('anyone@example.com', 'anything')

      expect(result).toBe(false)
    })
  })

  describe('logout', () => {
    it('destroys the session', async () => {
      const session = makeSession({ isAuthenticated: true })
      getIronSessionMock.mockResolvedValue(session)

      await logout()

      expect(session.destroy).toHaveBeenCalled()
    })
  })

  describe('isAdminConfigured', () => {
    it('returns true when legacy env-var admin credentials are set', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com'
      process.env.ADMIN_PASSWORD_HASH = 'hash'

      expect(await isAdminConfigured()).toBe(true)
      expect(prismaMock.adminUser.findFirst).not.toHaveBeenCalled()
    })

    it('returns true when a database admin row exists', async () => {
      delete process.env.ADMIN_EMAIL
      delete process.env.ADMIN_PASSWORD_HASH
      prismaMock.adminUser.findFirst.mockResolvedValue({ id: 'admin-1' })

      expect(await isAdminConfigured()).toBe(true)
    })

    it('returns false when no admin exists anywhere', async () => {
      delete process.env.ADMIN_EMAIL
      delete process.env.ADMIN_PASSWORD_HASH
      prismaMock.adminUser.findFirst.mockResolvedValue(null)

      expect(await isAdminConfigured()).toBe(false)
    })
  })

  describe('createAdminAccount', () => {
    it('creates an admin with a bcrypt-hashed password when none is configured yet', async () => {
      delete process.env.ADMIN_EMAIL
      delete process.env.ADMIN_PASSWORD_HASH
      prismaMock.adminUser.findFirst.mockResolvedValue(null)
      bcryptMock.hash.mockResolvedValue('hashed-password' as never)
      prismaMock.adminUser.create.mockResolvedValue({ id: 'admin-1' })

      const result = await createAdminAccount('admin@example.com', 'super-secret')

      expect(result).toEqual({ success: true })
      expect(bcrypt.hash).toHaveBeenCalledWith('super-secret', 12)
      expect(prismaMock.adminUser.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@example.com',
          passwordHash: 'hashed-password',
          sessionSecret: 'generated-secret-hex'
        }
      })
    })

    it('rejects if an admin is already configured, without touching the database', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com'
      process.env.ADMIN_PASSWORD_HASH = 'hash'

      const result = await createAdminAccount('new-admin@example.com', 'super-secret')

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/already configured/i)
      expect(prismaMock.adminUser.create).not.toHaveBeenCalled()
    })
  })

  describe('hashPassword', () => {
    it('hashes with 12 bcrypt rounds', async () => {
      bcryptMock.hash.mockResolvedValue('hashed' as never)

      const result = await hashPassword('my-password')

      expect(result).toBe('hashed')
      expect(bcrypt.hash).toHaveBeenCalledWith('my-password', 12)
    })
  })
})
