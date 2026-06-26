import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRewriteModel } from '@/lib/gemini'
import { REWRITE_SYSTEM_PROMPT } from '@/lib/prompts'
import { TONE_OPTIONS, ToneOption } from '@/lib/types'

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

  if (!TONE_OPTIONS.includes(obj.tone as ToneOption)) {
    return NextResponse.json({ error: 'Invalid tone' }, { status: 400 })
  }

  const tone = obj.tone as ToneOption

  if (typeof obj.jobAd !== 'string' || obj.jobAd.trim() === '') {
    return NextResponse.json({ error: 'jobAd is required' }, { status: 400 })
  }

  const contextLines: string[] = []
  if (typeof obj.companyName === 'string' && obj.companyName) {
    contextLines.push(`Company: ${obj.companyName}`)
  }
  if (typeof obj.companyDesc === 'string' && obj.companyDesc) {
    contextLines.push(`About the company: ${obj.companyDesc}`)
  }
  const userMessage = [...contextLines, `Original job ad:\n${obj.jobAd}`].join('\n\n')

  try {
    const model = getRewriteModel()
    const systemPrompt = REWRITE_SYSTEM_PROMPT.replace('{TONE}', tone)
    const result = await model.generateContent({
      systemInstruction: systemPrompt,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    })
    return NextResponse.json({ rewrite: result.response.text().trim() })
  } catch {
    return NextResponse.json({ error: 'Rewrite failed, please try again' }, { status: 500 })
  }
}
