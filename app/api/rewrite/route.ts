import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRewriteModel } from '@/lib/gemini'
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
  const userMessage = buildRewriteUserMessage(obj.jobAd, companyName, companyDesc)

  try {
    const model = getRewriteModel()
    const result = await model.generateContent({
      systemInstruction: REWRITE_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    })
    const raw = result.response.text()
    const rewrites = validateRewrites(JSON.parse(raw))
    return NextResponse.json(rewrites)
  } catch (err) {
    console.error('[rewrite] failed:', err)
    return NextResponse.json({ error: 'Rewrite failed, please try again' }, { status: 500 })
  }
}
