'use client'

import { useState } from 'react'
import { DiagnosisResult, ToneOption } from '@/lib/types'
import { ProgressIndicator } from '@/components/ProgressIndicator'
import { LoadingState } from '@/components/LoadingState'
import { StepInput } from '@/components/steps/StepInput'
import { StepDiagnosis } from '@/components/steps/StepDiagnosis'
import { StepRewrite } from '@/components/steps/StepRewrite'

const ANALYSE_MESSAGES = [
  'Reading your job ad…',
  'Checking for bias risks…',
  'Analysing employer brand…',
  'Almost there…',
]

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [jobAd, setJobAd] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyDesc, setCompanyDesc] = useState('')
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [tone, setTone] = useState<ToneOption>('warm')
  const [rewriteCache, setRewriteCache] = useState<Partial<Record<ToneOption, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyse = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, companyName, companyDesc }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setDiagnosis(data)
      setStep(2)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRewrite = async (selectedTone: ToneOption) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, tone: selectedTone, companyName, companyDesc }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Rewrite failed. Please try again.')
        return
      }
      setRewriteCache((prev) => ({ ...prev, [selectedTone]: data.rewrite }))
    } catch {
      setError('Rewrite failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToRewrite = async () => {
    setStep(3)
    if (!rewriteCache[tone]) {
      await fetchRewrite(tone)
    }
  }

  const handleToneChange = async (newTone: ToneOption) => {
    setTone(newTone)
    if (rewriteCache[newTone]) return
    await fetchRewrite(newTone)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ProgressIndicator currentStep={step} />
      <div className="flex-1 flex flex-col items-center pt-14 pb-12 px-4">
        <div className="w-full max-w-lg">
          <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {step === 1 && (
              <>
                {isLoading ? (
                  <LoadingState messages={ANALYSE_MESSAGES} />
                ) : (
                  <StepInput
                    jobAd={jobAd}
                    companyName={companyName}
                    companyDesc={companyDesc}
                    onJobAdChange={setJobAd}
                    onCompanyNameChange={setCompanyName}
                    onCompanyDescChange={setCompanyDesc}
                    onSubmit={handleAnalyse}
                    isLoading={isLoading}
                    error={error}
                  />
                )}
              </>
            )}

            {step === 2 && diagnosis && (
              <StepDiagnosis
                diagnosis={diagnosis}
                onNext={handleGoToRewrite}
                isLoading={isLoading}
              />
            )}

            {step === 3 && (
              <StepRewrite
                tone={tone}
                rewriteCache={rewriteCache}
                isLoading={isLoading}
                error={error}
                onToneChange={handleToneChange}
                onRetry={() => fetchRewrite(tone)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
