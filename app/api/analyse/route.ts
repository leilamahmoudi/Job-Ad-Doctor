import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateAnalyseInput } from './validate'
import { getAnalyseModel } from '@/lib/gemini'
import { ANALYSE_SYSTEM_PROMPT, buildAnalyseUserMessage } from '@/lib/prompts'
import { validateDiagnosis } from '@/lib/validate-diagnosis'

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

  let parsed: unknown
  try {
    const model = getAnalyseModel()
    const result = await model.generateContent({
      systemInstruction: ANALYSE_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    })
    const raw = result.response.text()
    console.log('[analyse] Gemini raw response:', raw.slice(0, 500))
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error('[analyse] Gemini call or JSON.parse failed:', err)
    return NextResponse.json({ error: 'Analysis failed, please try again' }, { status: 500 })
  }

  let diagnosis
  try {
    diagnosis = validateDiagnosis(parsed)
  } catch (err) {
    console.error('[analyse] validateDiagnosis failed:', err, JSON.stringify(parsed).slice(0, 300))
    return NextResponse.json({ error: 'Analysis failed, please try again' }, { status: 500 })
  }

  if (!diagnosis.isJobAd) {
    return NextResponse.json(
      { error: "This doesn't look like a job ad. Try pasting the full posting." },
      { status: 422 }
    )
  }

  if (!diagnosis.isLegal) {
    return NextResponse.json({ error: "We can't analyse this ad." }, { status: 422 })
  }

  return NextResponse.json(diagnosis)
}
