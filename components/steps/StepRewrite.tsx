'use client'

import { useState } from 'react'
import { ToneOption } from '@/lib/types'
import { TonePicker } from '@/components/TonePicker'
import { LoadingState } from '@/components/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const REWRITE_MESSAGES = [
  'Rewriting in {tone} tone…',
  'Preserving your job details…',
  'Polishing the language…',
]

interface StepRewriteProps {
  tone: ToneOption
  rewriteCache: Partial<Record<ToneOption, string>>
  isLoading: boolean
  error: string | null
  onToneChange: (tone: ToneOption) => void
  onRetry: () => void
}

export function StepRewrite({ tone, rewriteCache, isLoading, error, onToneChange, onRetry }: StepRewriteProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const rewrite = rewriteCache[tone]

  const messages = REWRITE_MESSAGES.map((m) => m.replace('{tone}', tone))

  const handleSend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    if (!rewrite) return
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
        <h2 className="text-xl font-bold text-gray-900">Your rewritten job ad</h2>
        <p className="text-sm text-gray-500 mt-1">Adjust the tone, then send it to your inbox.</p>
      </div>

      <TonePicker selected={tone} onChange={onToneChange} />

      {isLoading ? (
        <LoadingState messages={messages} />
      ) : error ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={onRetry} className="w-full">
            Try again
          </Button>
        </div>
      ) : rewrite ? (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100">
          {rewrite}
        </div>
      ) : null}

      {rewrite && !isLoading && (
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
      )}
    </div>
  )
}
