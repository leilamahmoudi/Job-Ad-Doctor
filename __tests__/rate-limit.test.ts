import { describe, it, expect, vi, beforeEach } from 'vitest'

// Override env before importing the module
vi.stubEnv('NODE_ENV', 'production')

// We need to re-import with a fresh module state for each test group,
// so we use a factory that resets the store by re-importing
let checkRateLimit: (ip: string) => { allowed: boolean; remaining: number }

beforeEach(async () => {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', 'production')
  const mod = await import('../lib/rate-limit')
  checkRateLimit = mod.checkRateLimit
})

describe('checkRateLimit', () => {
  it('allows the first request', () => {
    const result = checkRateLimit('1.1.1.1')
    expect(result.allowed).toBe(true)
  })

  it('allows up to the limit and blocks at limit+1', () => {
    const ip = '2.2.2.2'
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true)
    }
    expect(checkRateLimit(ip).allowed).toBe(false)
  })

  it('resets after the window expires', () => {
    vi.useFakeTimers()
    const ip = '3.3.3.3'
    for (let i = 0; i < 10; i++) checkRateLimit(ip)
    expect(checkRateLimit(ip).allowed).toBe(false)

    vi.advanceTimersByTime(60 * 60 * 1000 + 1)
    expect(checkRateLimit(ip).allowed).toBe(true)
    vi.useRealTimers()
  })

  it('tracks two IPs independently', () => {
    const ip1 = '4.4.4.4'
    const ip2 = '5.5.5.5'
    for (let i = 0; i < 10; i++) checkRateLimit(ip1)
    expect(checkRateLimit(ip1).allowed).toBe(false)
    expect(checkRateLimit(ip2).allowed).toBe(true)
  })

  it('decrements remaining correctly', () => {
    const ip = '6.6.6.6'
    const r1 = checkRateLimit(ip)
    expect(r1.remaining).toBe(9)
    const r2 = checkRateLimit(ip)
    expect(r2.remaining).toBe(8)
  })
})
