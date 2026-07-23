import { middleware } from './middleware'
import { NextRequest } from 'next/server'

function makeRequest(
  path: string,
  {
    method = 'GET',
    origin,
    host = 'store.example.com',
    cookie
  }: { method?: string; origin?: string; host?: string; cookie?: string } = {}
) {
  const headers: Record<string, string> = { host }
  if (origin) headers['origin'] = origin
  if (cookie) headers['cookie'] = cookie

  return new NextRequest(new URL(`https://${host}${path}`), {
    method,
    headers
  })
}

describe('middleware', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.DEMO_MODE
    delete process.env.DISABLE_AUTH_FOR_LOCAL_DEV
    delete process.env.ALLOWED_ORIGINS
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('demo-mode write blocking', () => {
    it('blocks a write to a non-allowlisted API path in demo mode', async () => {
      process.env.DEMO_MODE = 'true'

      const response = await middleware(makeRequest('/api/abc123/products', { method: 'POST' }))

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toMatch(/read-only demo/i)
    })

    it('allows writes to the always-allowed paths even in demo mode', async () => {
      process.env.DEMO_MODE = 'true'

      const response = await middleware(makeRequest('/api/auth/login', { method: 'POST' }))

      // Not blocked with 403 by the write-block branch; falls through to the
      // demo-mode login-gate bypass further down (still not a 403).
      expect(response.status).not.toBe(403)
    })

    it('allows GET requests through in demo mode (reads are never blocked)', async () => {
      process.env.DEMO_MODE = 'true'

      const response = await middleware(makeRequest('/api/abc123/products', { method: 'GET' }))

      expect(response.status).not.toBe(403)
    })

    it('does not block writes when demo mode is off', async () => {
      const response = await middleware(makeRequest('/api/abc123/products', { method: 'POST' }))

      expect(response.status).not.toBe(403)
    })
  })

  describe('store-scoped API CORS validation', () => {
    it('forbids a store-scoped request from a disallowed origin', async () => {
      const response = await middleware(
        makeRequest('/api/abc123/products', { origin: 'https://evil.example.com' })
      )

      expect(response.status).toBe(403)
    })

    it('allows a store-scoped request from an explicitly allowed origin and sets CORS headers', async () => {
      // ALLOWED_ORIGINS is read into a module-level constant at import time, so
      // setting process.env here wouldn't take effect; instead we exercise one
      // of the module's own default-allowed origins.
      const response = await middleware(
        makeRequest('/api/abc123/products', { origin: 'https://your-production-domain.com' })
      )

      expect(response.status).not.toBe(403)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://your-production-domain.com'
      )
    })

    it('allows a same-host origin (comparing against the request Host header)', async () => {
      const response = await middleware(
        makeRequest('/api/abc123/products', {
          origin: 'https://store.example.com',
          host: 'store.example.com'
        })
      )

      expect(response.status).not.toBe(403)
    })

    it('allows requests with no Origin header (same-origin/non-browser requests)', async () => {
      const response = await middleware(makeRequest('/api/abc123/products'))

      expect(response.status).not.toBe(403)
    })
  })

  describe('demo-mode / local-dev auth bypass', () => {
    it('redirects /login to / when demo mode is enabled', async () => {
      process.env.DEMO_MODE = 'true'

      const response = await middleware(makeRequest('/login'))

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://store.example.com/')
    })

    it('redirects /setup to / when DISABLE_AUTH_FOR_LOCAL_DEV is enabled', async () => {
      process.env.DISABLE_AUTH_FOR_LOCAL_DEV = 'true'

      const response = await middleware(makeRequest('/setup'))

      expect(response.status).toBe(307)
    })

    it('passes through non-login/setup routes when DISABLE_AUTH_FOR_LOCAL_DEV is enabled, without a session cookie', async () => {
      process.env.DISABLE_AUTH_FOR_LOCAL_DEV = 'true'

      const response = await middleware(makeRequest('/products'))

      expect(response.status).not.toBe(307)
      expect(response.status).not.toBe(403)
    })
  })

  describe('public route allowlist', () => {
    it.each(['/api/webhook', '/api/auth/login', '/login', '/setup'])(
      'allows %s through without a session cookie',
      async (path) => {
        const response = await middleware(makeRequest(path))
        expect(response.status).not.toBe(307)
      }
    )

    it('allows static-looking paths (containing a dot) through', async () => {
      const response = await middleware(makeRequest('/favicon.ico'))
      expect(response.status).not.toBe(307)
    })
  })

  describe('session-cookie gate', () => {
    it('redirects to /login when there is no session cookie', async () => {
      const response = await middleware(makeRequest('/dashboard'))

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://store.example.com/login')
    })

    it('passes through when a session cookie is present', async () => {
      const response = await middleware(
        makeRequest('/dashboard', { cookie: 'cms_session=some-value' })
      )

      expect(response.status).not.toBe(307)
    })
  })
})
