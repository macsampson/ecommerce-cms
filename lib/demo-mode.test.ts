import { isDemoModeEnabled, isDemoWriteBlocked } from './demo-mode'

const ORIGINAL_ENV = process.env.DEMO_MODE

afterEach(() => {
  process.env.DEMO_MODE = ORIGINAL_ENV
})

describe('isDemoModeEnabled', () => {
  it('is false when DEMO_MODE is unset', () => {
    delete process.env.DEMO_MODE
    expect(isDemoModeEnabled()).toBe(false)
  })

  it('is true only when DEMO_MODE is exactly "true"', () => {
    process.env.DEMO_MODE = 'true'
    expect(isDemoModeEnabled()).toBe(true)

    process.env.DEMO_MODE = 'yes'
    expect(isDemoModeEnabled()).toBe(false)
  })
})

describe('isDemoWriteBlocked', () => {
  it('never blocks anything when demo mode is off', () => {
    process.env.DEMO_MODE = 'false'
    expect(isDemoWriteBlocked('POST', '/api/store-1/products')).toBe(false)
  })

  it('blocks write methods against the admin API when demo mode is on', () => {
    process.env.DEMO_MODE = 'true'
    expect(isDemoWriteBlocked('POST', '/api/store-1/products')).toBe(true)
    expect(isDemoWriteBlocked('PUT', '/api/stores/store-1')).toBe(true)
    expect(isDemoWriteBlocked('PATCH', '/api/store-1/orders-summary')).toBe(true)
    expect(isDemoWriteBlocked('DELETE', '/api/store-1/products/prod-1')).toBe(true)
  })

  it('never blocks read methods', () => {
    process.env.DEMO_MODE = 'true'
    expect(isDemoWriteBlocked('GET', '/api/store-1/products')).toBe(false)
    expect(isDemoWriteBlocked('HEAD', '/api/store-1/products')).toBe(false)
    expect(isDemoWriteBlocked('OPTIONS', '/api/store-1/checkout')).toBe(false)
  })

  it('never blocks non-API routes', () => {
    process.env.DEMO_MODE = 'true'
    expect(isDemoWriteBlocked('POST', '/login')).toBe(false)
  })

  it('always allows login, logout, webhook, and cron even in demo mode', () => {
    process.env.DEMO_MODE = 'true'
    expect(isDemoWriteBlocked('POST', '/api/auth/login')).toBe(false)
    expect(isDemoWriteBlocked('POST', '/api/auth/logout')).toBe(false)
    expect(isDemoWriteBlocked('POST', '/api/webhook')).toBe(false)
    expect(isDemoWriteBlocked('POST', '/api/cron')).toBe(false)
    expect(isDemoWriteBlocked('GET', '/api/cron')).toBe(false)
  })
})
