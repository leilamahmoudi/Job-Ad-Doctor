'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface StepInputProps {
  jobAd: string
  companyName: string
  companyDesc: string
  onJobAdChange: (v: string) => void
  onCompanyNameChange: (v: string) => void
  onCompanyDescChange: (v: string) => void
  onSubmit: () => void
  error: string | null
}

export function StepInput({
  jobAd,
  companyName,
  companyDesc,
  onJobAdChange,
  onCompanyNameChange,
  onCompanyDescChange,
  onSubmit,
  error,
}: StepInputProps) {
  const [contextOpen, setContextOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (jobAd.trim() === '') {
      setValidationError('Please paste your job ad.')
      return
    }
    const wordCount = jobAd.trim().split(/\s+/).length
    if (wordCount < 100) {
      setValidationError(
        `Your job ad is too short (${wordCount} words). Please paste the full posting.`
      )
      return
    }
    setValidationError(null)
    onSubmit()
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold text-foreground leading-[1.15]">
        Your job ad, rewritten by an expert.
      </h1>

      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Paste your job ad here..."
          value={jobAd}
          onChange={(e) => onJobAdChange(e.target.value)}
          className="min-h-[160px] text-sm resize-none rounded-xl"
        />
        {(validationError || error) && (
          <p className="text-sm text-red-600">{validationError ?? error}</p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setContextOpen((o) => !o)}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium cursor-pointer"
        >
          {contextOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          Add company context (improves results)
        </button>
        {contextOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <Input
              placeholder="Company name"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              className="text-sm rounded-xl"
            />
            <Input
              placeholder="One-line description (e.g. We build climate tech for SMEs)"
              value={companyDesc}
              onChange={(e) => onCompanyDescChange(e.target.value)}
              className="text-sm rounded-xl"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="btn-amber w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150"
      >
        Analyse my job ad
      </button>
    </div>
  )
}
