'use client'

import { useState, useRef } from 'react'
import { AllRewrites, DiagnosisResult, ToneOption } from '@/lib/types'
import { ProgressIndicator } from '@/components/ProgressIndicator'
import { LoadingState } from '@/components/LoadingState'
import { StepInput } from '@/components/steps/StepInput'
import { StepDiagnosis } from '@/components/steps/StepDiagnosis'
import { StepRewrite } from '@/components/steps/StepRewrite'

const ANALYSE_MESSAGES = [
  'Reading your job ad...',
  'Checking for bias risks...',
  'Analysing employer brand...',
  'Almost there...',
]

const REWRITE_MESSAGES = [
  'Rewriting in 3 tones...',
  'Preserving your job details...',
  'Polishing the language...',
  'Almost ready...',
]

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [jobAd, setJobAd] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyDesc, setCompanyDesc] = useState('')
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [tone, setTone] = useState<ToneOption>('warm')
  const [rewrites, setRewrites] = useState<AllRewrites | null>(null)

  const [hasIterated, setHasIterated] = useState(false)

  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [analyseError, setAnalyseError] = useState<string | null>(null)
  const [rewriteError, setRewriteError] = useState<string | null>(null)
  const [iterateError, setIterateError] = useState<string | null>(null)

  // Prefetch: rewrite starts in the background as soon as diagnosis completes.
  // By the time the user reads the diagnosis and clicks through, it's ready.
  const prefetchedRewrites = useRef<AllRewrites | null>(null)
  const prefetchPromise = useRef<Promise<void> | null>(null)

  const fetchRewrites = (ad: string, name: string, desc: string) =>
    fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobAd: ad, companyName: name, companyDesc: desc }),
    })

  const startPrefetch = (ad: string, name: string, desc: string) => {
    prefetchedRewrites.current = null
    prefetchPromise.current = fetchRewrites(ad, name, desc)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) prefetchedRewrites.current = data })
      .catch(() => {})
  }

  const runAnalyse = async (extraBody: Record<string, string> = {}) => {
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobAd, companyName, companyDesc, ...extraBody }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
    return data
  }

  const handleAnalyse = async () => {
    setIsAnalysing(true)
    setAnalyseError(null)
    setHasIterated(false)
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
      // Start rewrite in the background while user reads diagnosis
      startPrefetch(jobAd, companyName, companyDesc)
    } catch {
      setAnalyseError('Something went wrong. Please try again.')
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleIterate = async (note: string) => {
    setIsAnalysing(true)
    setIterateError(null)
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, companyName, companyDesc, iterationNote: note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
      setRewrites(data)
      setHasIterated(true)
    } catch (err) {
      setIterateError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleGoToRewrite = async () => {
    // If prefetch already resolved, use it instantly
    if (prefetchedRewrites.current) {
      setRewrites(prefetchedRewrites.current)
      setStep(3)
      return
    }

    // If prefetch is still in flight, wait for it instead of making a second request
    if (prefetchPromise.current) {
      setIsRewriting(true)
      setRewriteError(null)
      try {
        await prefetchPromise.current
        if (prefetchedRewrites.current) {
          setRewrites(prefetchedRewrites.current)
          setStep(3)
          return
        }
      } catch {
        // Fall through to fresh fetch
      } finally {
        setIsRewriting(false)
      }
    }

    // Fallback: fresh fetch (e.g. prefetch failed silently)
    setIsRewriting(true)
    setRewriteError(null)
    try {
      const res = await fetchRewrites(jobAd, companyName, companyDesc)
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

  const handleStepClick = (s: 1 | 2 | 3) => {
    if (s < step) setStep(s)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ProgressIndicator currentStep={step} onStepClick={handleStepClick} />
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
              isAnalysing ? (
                <LoadingState messages={ANALYSE_MESSAGES} />
              ) : isRewriting ? (
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
              isAnalysing ? (
                <LoadingState messages={ANALYSE_MESSAGES} />
              ) : (
                <StepRewrite
                  tone={tone}
                  rewrites={rewrites}
                  onToneChange={setTone}
                  onBack={() => setStep(2)}
                  onIterate={handleIterate}
                  hasIterated={hasIterated}
                  iterateError={iterateError}
                />
              )
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
