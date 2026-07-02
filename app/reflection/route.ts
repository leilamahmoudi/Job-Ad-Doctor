import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-static'

export function GET() {
  const html = readFileSync(join(process.cwd(), 'docs/joint-reflection-presentation.html'), 'utf-8')
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
