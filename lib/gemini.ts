import { GoogleGenerativeAI, GenerateContentRequest } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  console.error('[gemini] GEMINI_API_KEY is not set — all AI calls will fail')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODEL_CASCADE = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
] as const

function shouldFallback(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('404') || msg.includes('not found') || msg.includes('not supported')
  )
}

export async function generateJSON(
  systemInstruction: string,
  userMessage: string
): Promise<{ text: string; model: string }> {
  let lastErr: unknown

  for (const model of MODEL_CASCADE) {
    try {
      const instance = genAI.getGenerativeModel({
        model,
        generationConfig: { responseMimeType: 'application/json' },
      })
      const req: GenerateContentRequest = {
        systemInstruction,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      }
      const result = await instance.generateContent(req)
      const text = result.response.text()
      if (model !== MODEL_CASCADE[0]) {
        console.warn(`[gemini] using degraded model ${model}`)
      }
      return { text, model }
    } catch (err) {
      if (shouldFallback(err)) {
        const msg = err instanceof Error ? err.message.slice(0, 120) : String(err)
        console.warn(`[gemini] falling back from ${model}: ${msg}`)
        lastErr = err
        continue
      }
      // Non-retriable error: rethrow immediately
      throw err
    }
  }

  // All models exhausted
  throw lastErr
}
