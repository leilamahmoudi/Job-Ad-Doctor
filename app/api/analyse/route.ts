import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateAnalyseInput } from './validate'
import { generateJSON } from '@/lib/gemini'
import { ANALYSE_SYSTEM_PROMPT, buildAnalyseUserMessage } from '@/lib/prompts'
import { validateDiagnosis } from '@/lib/validate-diagnosis'

const isDev = process.env.NODE_ENV === 'development'

function fail500(userMsg: string, devDetail: string) {
  console.error(`[analyse] ${devDetail}`)
  const body = isDev ? { error: `${userMsg} [dev: ${devDetail}]` } : { error: userMsg }
  return NextResponse.json(body, { status: 500 })
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

  const validation = validateAnalyseInput(body)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: validation.status })
  }

  const { jobAd, companyName, companyDesc, iterationNote } = validation
  const userMessage = buildAnalyseUserMessage(jobAd, companyName, companyDesc, iterationNote)

  let raw: string
  try {
    const { text, model } = await generateJSON(ANALYSE_SYSTEM_PROMPT, userMessage)
    raw = text
    console.log(`[analyse] model=${model} raw (first 800 chars):`, raw.slice(0, 800))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      console.error('[analyse] All models quota-exhausted')
      return NextResponse.json(
        { error: "We've hit our AI usage limit. Please try again in a few minutes." },
        { status: 429 }
      )
    }
    if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
      console.error('[analyse] API key issue — check GEMINI_API_KEY env var')
    }
    return fail500('Analysis failed, please try again', `Gemini call failed: ${msg}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analyse] Full raw response that failed JSON.parse:', raw)
    return fail500('Analysis failed, please try again', `JSON.parse failed: ${msg} — raw: ${raw.slice(0, 200)}`)
  }

  let diagnosis
  try {
    diagnosis = validateDiagnosis(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const snippet = JSON.stringify(parsed).slice(0, 300)
    return fail500('Analysis failed, please try again', `validateDiagnosis failed: ${msg} — parsed: ${snippet}`)
  }

  if (!diagnosis.isJobAd) {
    return NextResponse.json(
      { error: "This doesn't look like a job ad. Try pasting the full posting." },
      { status: 422 }
    )
  }

  if (!diagnosis.isLegal) {
    return NextResponse.json(
      { error: "We can't analyse this ad.", reason: diagnosis.illegalReason ?? null },
      { status: 422 }
    )
  }

  return NextResponse.json(diagnosis)
}
