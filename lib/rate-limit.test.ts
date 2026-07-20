import { rateLimit, getClientIp } from './rate-limit'

describe('rateLimit', () => {
  it('allows requests up to the limit within the window', () => {
    const key = `test-${Math.random()}`
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true)
    }
  })

  it('blocks requests once the limit is exceeded within the window', () => {
    const key = `test-${Math.random()}`
    rateLimit(key, 2, 60_000)
    rateLimit(key, 2, 60_000)

    const result = rateLimit(key, 2, 60_000)

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets the count once the window has elapsed', () => {
    const key = `test-${Math.random()}`
    const nowSpy = jest.spyOn(Date, 'now')

    nowSpy.mockReturnValue(1_000_000)
    rateLimit(key, 1, 1000)
    expect(rateLimit(key, 1, 1000).allowed).toBe(false)

    nowSpy.mockReturnValue(1_002_000)
    expect(rateLimit(key, 1, 1000).allowed).toBe(true)

    nowSpy.mockRestore()
  })

  it('tracks separate keys independently', () => {
    const keyA = `test-a-${Math.random()}`
    const keyB = `test-b-${Math.random()}`

    rateLimit(keyA, 1, 60_000)
    expect(rateLimit(keyA, 1, 60_000).allowed).toBe(false)
    expect(rateLimit(keyB, 1, 60_000).allowed).toBe(true)
  })
})

describe('getClientIp', () => {
  it('uses the first entry in x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }
    })

    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' }
    })

    expect(getClientIp(req)).toBe('9.9.9.9')
  })

  it('falls back to "unknown" when neither header is present', () => {
    const req = new Request('http://localhost')

    expect(getClientIp(req)).toBe('unknown')
  })
})
