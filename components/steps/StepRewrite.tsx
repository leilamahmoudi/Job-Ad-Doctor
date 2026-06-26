'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AllRewrites, ToneOption } from '@/lib/types'
import { TonePicker } from '@/components/TonePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StepRewriteProps {
  tone: ToneOption
  rewrites: AllRewrites
  onToneChange: (tone: ToneOption) => void
  onBack: () => void
}

export function StepRewrite({ tone, rewrites, onToneChange, onBack }: StepRewriteProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const rewrite = rewrites[tone]

  const handleSend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError(null)
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/send-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rewrite }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSendError(data.error ?? "Couldn't send the email. Please try again.")
      } else {
        setSent(true)
      }
    } catch {
      setSendError("Couldn't send the email. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">Your rewritten job ad</h2>
        <p className="text-sm text-gray-500 mt-1">
          All three versions are ready — switch tones instantly.
        </p>
      </div>

      <TonePicker selected={tone} onChange={onToneChange} />

      <div className="bg-white rounded-lg border border-gray-200 p-5 prose prose-sm prose-gray max-w-none
        [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-1
        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-3 [&_h3]:mb-1
        [&_ul]:mt-1 [&_ul]:mb-2 [&_ul]:pl-4 [&_li]:text-gray-700 [&_li]:text-sm [&_li]:leading-relaxed
        [&_p]:text-gray-700 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2
        [&_strong]:text-gray-900">
        <ReactMarkdown>{rewrite}</ReactMarkdown>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        {sent ? (
          <p className="text-sm text-green-700 font-medium text-center py-2">
            Check your inbox — your rewrite is on its way.
          </p>
        ) : (
          <>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-400">No spam. We&apos;ll send your rewrite once.</p>
            {(emailError || sendError) && (
              <p className="text-sm text-red-600">{emailError ?? sendError}</p>
            )}
            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? 'Sending…' : 'Send to my inbox →'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
