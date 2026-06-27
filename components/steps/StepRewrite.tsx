'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { AllRewrites, ToneOption, TONE_LABELS } from '@/lib/types'
import { TonePicker } from '@/components/TonePicker'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface StepRewriteProps {
  tone: ToneOption
  rewrites: AllRewrites
  onToneChange: (tone: ToneOption) => void
  onBack: () => void
  onIterate: (note: string) => void
  hasIterated: boolean
  iterateError: string | null
}

export function StepRewrite({
  tone,
  rewrites,
  onToneChange,
  onBack,
  onIterate,
  hasIterated,
  iterateError,
}: StepRewriteProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)

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

  const handleIterate = () => {
    if (!note.trim()) {
      setNoteError('Please add some context before re-analysing.')
      return
    }
    setNoteError(null)
    onIterate(note.trim())
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mb-4 cursor-pointer"
        >
          Back
        </button>
        <h2 className="text-xl font-bold text-foreground">Your rewritten job ad</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All three versions are ready. Switch tones instantly.
        </p>
      </div>

      <TonePicker selected={tone} onChange={onToneChange} />

      <div key={tone} className="animate-in fade-in duration-200 bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="h-1 bg-primary" />
        <div className="p-5 prose prose-sm prose-gray max-w-none
          [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-1
          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1
          [&_ul]:mt-1 [&_ul]:mb-2 [&_ul]:pl-4 [&_li]:text-muted-foreground [&_li]:text-sm [&_li]:leading-relaxed
          [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2
          [&_strong]:text-foreground">
          <ReactMarkdown>{rewrite}</ReactMarkdown>
        </div>
      </div>

      {/* Doctor's Notes */}
      <div className="border border-primary/20 rounded-xl p-4 flex flex-col gap-3 bg-amber-50">
        {hasIterated ? (
          <p className="text-sm text-primary font-medium flex items-center gap-1.5">
            <CheckCircle2 className="size-4" /> Analysis refined
          </p>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">&#8478; Doctor&apos;s notes</p>
              <p className="text-sm font-medium text-foreground">Something look off?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add context and we&apos;ll re-analyse once. e.g. &quot;We do list salary on the benefits page&quot; or &quot;This is for a senior audience&quot;.
              </p>
            </div>
            <Textarea
              placeholder="Add context to refine this analysis..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm resize-none min-h-[80px] bg-white focus-visible:ring-primary"
            />
            {(noteError || iterateError) && (
              <p className="text-sm text-red-600">{noteError ?? iterateError}</p>
            )}
            <Button variant="outline" onClick={handleIterate} className="w-full border-primary/30 hover:border-primary">
              Re-analyse with this context
            </Button>
          </>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        {sent ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="size-8 text-primary" />
            <p className="text-base font-semibold text-foreground">Your rewrite is on its way.</p>
            <p className="text-sm text-muted-foreground">
              Check your inbox. We sent the {TONE_LABELS[tone].label.toLowerCase()} version.
            </p>
          </div>
        ) : (
          <>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">No spam. We&apos;ll send your rewrite once.</p>
            {(emailError || sendError) && (
              <p className="text-sm text-red-600">{emailError ?? sendError}</p>
            )}
            <button
              onClick={handleSend}
              disabled={sending}
              className="btn-amber w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send to my inbox'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
