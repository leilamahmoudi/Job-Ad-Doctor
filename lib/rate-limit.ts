// STUB: in-memory, resets on server restart.
// Production: replace with Upstash Redis + @upstash/ratelimit
const isDev = process.env.NODE_ENV === 'development'

const HOURLY_MS = 60 * 60 * 1000
const DAILY_MS = 24 * 60 * 60 * 1000

const MAX_HOURLY = isDev ? 1000 : 10       // per IP per hour
const MAX_DAILY = isDev ? 10_000 : 20      // per IP per day
const GLOBAL_DAILY_MAX = isDev ? 1_000_000 : 500  // total requests across all IPs per day

interface Entry {
  hourlyCount: number
  hourlyResetAt: number
  dailyCount: number
  dailyResetAt: number
}

const store = new Map<string, Entry>()
let globalCount = 0
let globalResetAt = Date.now() + DAILY_MS

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()

  // Reset global daily counter
  if (now > globalResetAt) {
    globalCount = 0
    globalResetAt = now + DAILY_MS
  }

  if (globalCount >= GLOBAL_DAILY_MAX) {
    return { allowed: false, remaining: 0 }
  }

  let entry = store.get(ip)

  if (!entry) {
    entry = {
      hourlyCount: 0,
      hourlyResetAt: now + HOURLY_MS,
      dailyCount: 0,
      dailyResetAt: now + DAILY_MS,
    }
  }

  if (now > entry.hourlyResetAt) {
    entry.hourlyCount = 0
    entry.hourlyResetAt = now + HOURLY_MS
  }

  if (now > entry.dailyResetAt) {
    entry.dailyCount = 0
    entry.dailyResetAt = now + DAILY_MS
  }

  if (entry.hourlyCount >= MAX_HOURLY || entry.dailyCount >= MAX_DAILY) {
    store.set(ip, entry)
    return { allowed: false, remaining: 0 }
  }

  entry.hourlyCount++
  entry.dailyCount++
  globalCount++
  store.set(ip, entry)

  const remaining = Math.min(MAX_HOURLY - entry.hourlyCount, MAX_DAILY - entry.dailyCount)
  return { allowed: true, remaining }
}
