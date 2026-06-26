export function buildEmailHtml(rewrite: string): string {
  const body = rewrite
    .split('\n')
    .map((line) => (line.trim() === '' ? '<br>' : `${line}<br>`))
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 16px; color: #111;">
  <h2 style="font-size: 20px; margin-bottom: 24px;">Here's your rewritten job ad</h2>
  <div style="line-height: 1.7; white-space: pre-wrap;">${body}</div>
  <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">
  <p style="color: #9ca3af; font-size: 13px;">No spam. This is a one-time send from Job Ad Doctor.</p>
</body>
</html>`
}
