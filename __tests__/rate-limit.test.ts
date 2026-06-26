import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('NODE_ENV', 'production')

let checkRateLimit: (ip: string) => { allowed: boolean; remaining: number }

beforeEach(async () => {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', 'production')
  const mod = await import('../lib/rate-limit')
  checkRateLimit = mod.checkRateLimit
})

const HOURLY_MS = 60 * 60 * 1000
const DAILY_MS = 24 * 60 * 60 * 1000

describe('checkRateLimit — hourly window', () => {
  it('allows the first request', () => {
    expect(checkRateLimit('1.1.1.1').allowed).toBe(true)
  })

  it('allows up to the hourly limit and blocks at limit+1', () => {
    const ip = '2.2.2.2'
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true)
    }
    expect(checkRateLimit(ip).allowed).toBe(false)
  })

  it('resets after the hourly window expires', () => {
    vi.useFakeTimers()
    const ip = '3.3.3.3'
    for (let i = 0; i < 10; i++) checkRateLimit(ip)
    expect(checkRateLimit(ip).allowed).toBe(false)
    vi.advanceTimersByTime(HOURLY_MS + 1)
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
    expect(checkRateLimit(ip).remaining).toBe(9)
    expect(checkRateLimit(ip).remaining).toBe(8)
  })
})

describe('checkRateLimit — daily window', () => {
  it('blocks once daily limit is reached even after hourly window resets', () => {
    vi.useFakeTimers()
    const ip = '7.7.7.7'
    // Exhaust hourly limit (10), advance past it, exhaust again (20 total = daily limit)
    for (let i = 0; i < 10; i++) checkRateLimit(ip)
    vi.advanceTimersByTime(HOURLY_MS + 1)
    for (let i = 0; i < 10; i++) checkRateLimit(ip)
    // 21st call should be blocked by daily limit
    expect(checkRateLimit(ip).allowed).toBe(false)
    vi.useRealTimers()
  })

  it('resets after the daily window expires', () => {
    vi.useFakeTimers()
    const ip = '8.8.8.8'
    for (let i = 0; i < 10; i++) checkRateLimit(ip)
    vi.advanceTimersByTime(HOURLY_MS + 1)
    for (let i = 0; i < 10; i++) checkRateLimit(ip)
    expect(checkRateLimit(ip).allowed).toBe(false)
    vi.advanceTimersByTime(DAILY_MS + 1)
    expect(checkRateLimit(ip).allowed).toBe(true)
    vi.useRealTimers()
  })
})
