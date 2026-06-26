// STUB: in-memory Map, resets on server restart, not suitable for production
// Production: replace with Upstash Redis + @upstash/ratelimit
const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = process.env.NODE_ENV === 'development' ? 1000 : 10
const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}
