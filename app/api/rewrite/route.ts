import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { generateJSON } from '@/lib/gemini'
import { REWRITE_SYSTEM_PROMPT, buildRewriteUserMessage } from '@/lib/prompts'
import { AllRewrites } from '@/lib/types'

function validateRewrites(raw: unknown): AllRewrites {
  if (typeof raw !== 'object' || raw === null) throw new Error('not an object')
  const obj = raw as Record<string, unknown>
  if (typeof obj.direct !== 'string' || !obj.direct.trim()) throw new Error('missing direct')
  if (typeof obj.warm !== 'string' || !obj.warm.trim()) throw new Error('missing warm')
  if (typeof obj.professional !== 'string' || !obj.professional.trim()) throw new Error('missing professional')
  return { direct: obj.direct, warm: obj.warm, professional: obj.professional }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: "You've hit the limit. Try again in a bit." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const obj = body as Record<string, unknown>

  if (typeof obj.jobAd !== 'string' || obj.jobAd.trim() === '') {
    return NextResponse.json({ error: 'jobAd is required' }, { status: 400 })
  }

  const companyName = typeof obj.companyName === 'string' ? obj.companyName : undefined
  const companyDesc = typeof obj.companyDesc === 'string' ? obj.companyDesc : undefined
  const iterationNote = typeof obj.iterationNote === 'string' && obj.iterationNote.trim()
    ? obj.iterationNote.trim()
    : undefined
  const userMessage = buildRewriteUserMessage(obj.jobAd, companyName, companyDesc, iterationNote)

  let raw: string
  try {
    const { text, model } = await generateJSON(REWRITE_SYSTEM_PROMPT, userMessage)
    raw = text
    console.log(`[rewrite] model=${model} raw (first 400 chars):`, raw.slice(0, 400))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      console.error('[rewrite] All models quota-exhausted')
      return NextResponse.json(
        { error: "We've hit our AI usage limit. Please try again in a few minutes." },
        { status: 429 }
      )
    }
    if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
      console.error('[rewrite] API key issue — check GEMINI_API_KEY env var')
    }
    console.error('[rewrite] Gemini call failed:', msg)
    return NextResponse.json({ error: 'Rewrite failed, please try again' }, { status: 500 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error('[rewrite] JSON.parse failed:', err)
    console.error('[rewrite] Full raw response:', raw)
    return NextResponse.json({ error: 'Rewrite failed, please try again' }, { status: 500 })
  }

  let rewrites: AllRewrites
  try {
    rewrites = validateRewrites(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[rewrite] validateRewrites failed:', msg, JSON.stringify(parsed).slice(0, 300))
    return NextResponse.json({ error: 'Rewrite failed, please try again' }, { status: 500 })
  }

  return NextResponse.json(rewrites)
}
