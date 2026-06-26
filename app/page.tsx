'use client'

import { useState } from 'react'
import { AllRewrites, DiagnosisResult, ToneOption } from '@/lib/types'
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

const REWRITE_MESSAGES = [
  'Rewriting in 3 tones…',
  'Preserving your job details…',
  'Polishing the language…',
  'Almost ready…',
]

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [jobAd, setJobAd] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyDesc, setCompanyDesc] = useState('')
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [tone, setTone] = useState<ToneOption>('warm')
  const [rewrites, setRewrites] = useState<AllRewrites | null>(null)

  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [analyseError, setAnalyseError] = useState<string | null>(null)
  const [rewriteError, setRewriteError] = useState<string | null>(null)

  const handleAnalyse = async () => {
    setIsAnalysing(true)
    setAnalyseError(null)
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, companyName, companyDesc }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnalyseError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setDiagnosis(data)
      setStep(2)
    } catch {
      setAnalyseError('Something went wrong. Please try again.')
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleGoToRewrite = async () => {
    setIsRewriting(true)
    setRewriteError(null)
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, companyName, companyDesc }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRewriteError(data.error ?? 'Rewrite failed. Please try again.')
        return
      }
      setRewrites(data)
      setStep(3)
    } catch {
      setRewriteError('Rewrite failed. Please try again.')
    } finally {
      setIsRewriting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ProgressIndicator currentStep={step} />
      <div className="flex-1 flex flex-col items-center pt-14 pb-12 px-4">
        <div className="w-full max-w-lg">
          <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {step === 1 && (
              isAnalysing ? (
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
                  error={analyseError}
                />
              )
            )}

            {step === 2 && diagnosis && (
              isRewriting ? (
                <LoadingState messages={REWRITE_MESSAGES} />
              ) : (
                <StepDiagnosis
                  diagnosis={diagnosis}
                  onNext={handleGoToRewrite}
                  onBack={() => setStep(1)}
                  error={rewriteError}
                />
              )
            )}

            {step === 3 && rewrites && (
              <StepRewrite
                tone={tone}
                rewrites={rewrites}
                onToneChange={setTone}
                onBack={() => setStep(2)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
