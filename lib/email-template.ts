function markdownToEmailHtml(md: string): string {
  const lines = md.split('\n')
  const htmlLines: string[] = []
  let inList = false

  for (const raw of lines) {
    const line = raw
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')

    if (/^## (.+)$/.test(line)) {
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<h2 style="font-size:16px;font-weight:600;margin:20px 0 6px;color:#111;">${line.replace(/^## /, '')}</h2>`)
    } else if (/^### (.+)$/.test(line)) {
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<h3 style="font-size:14px;font-weight:600;margin:16px 0 4px;color:#111;">${line.replace(/^### /, '')}</h3>`)
    } else if (/^- (.+)$/.test(line)) {
      if (!inList) { htmlLines.push('<ul style="padding-left:20px;margin:8px 0;">'); inList = true }
      htmlLines.push(`<li style="margin:3px 0;color:#374151;">${line.replace(/^- /, '')}</li>`)
    } else if (line.trim() === '') {
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push('')
    } else {
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<p style="margin:0 0 10px;color:#374151;line-height:1.6;">${line}</p>`)
    }
  }

  if (inList) htmlLines.push('</ul>')
  return htmlLines.join('\n')
}

export function buildEmailHtml(rewrite: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 16px; color: #111;">
  <h1 style="font-size: 20px; margin-bottom: 24px;">Here&apos;s your rewritten job ad</h1>
  <div style="line-height: 1.7;">${markdownToEmailHtml(rewrite)}</div>
  <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">
  <p style="color: #9ca3af; font-size: 13px;">No spam. This is a one-time send from Job Ad Doctor.</p>
</body>
</html>`
}
