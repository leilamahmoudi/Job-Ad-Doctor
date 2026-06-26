import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { buildEmailHtml } from '@/lib/email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
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

  if (typeof obj.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (typeof obj.rewrite !== 'string' || obj.rewrite.trim() === '') {
    return NextResponse.json({ error: 'rewrite is required' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: obj.email,
      subject: 'Your rewritten job ad — from the Job Ad Doctor',
      html: buildEmailHtml(obj.rewrite),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Couldn't send the email. Please try again." },
      { status: 500 }
    )
  }
}
