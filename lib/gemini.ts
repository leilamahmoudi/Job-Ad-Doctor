import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// JSON mode: guarantees valid JSON output, no markdown fences
export const getAnalyseModel = () =>
  genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

// Plain text mode: rewrite output is prose, not JSON
export const getRewriteModel = () =>
  genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  })
