# Job Ad Doctor

A 3-step web app that diagnoses weaknesses in job ads and rewrites them in three tones — using Google Gemini, deployed on Vercel.

**Live:** [job-ad-doctor.vercel.app](https://job-ad-doctor.vercel.app)

---

## What it does

1. **Diagnose** — Paste a job ad. The app analyses it across 8 weakness categories (generic language, bias risks, compensation opacity, etc.) and flags what's broken with a specific explanation and a one-line fix.
2. **Rewrite** — Choose a tone (Direct, Warm, or Professional) and get a full rewrite with all three versions generated upfront.
3. **Email** — Send the rewrite to your inbox. One-time delivery, no spam.

---

## Stack

| Layer      | Choice                                                                |
| ---------- | --------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router)                                               |
| Language   | TypeScript                                                            |
| Styling    | Tailwind CSS + shadcn/ui                                              |
| LLM        | Google Gemini (`gemini-2.5-flash` → `gemini-2.5-flash-lite` fallback) |
| Email      | Resend                                                                |
| Deployment | Vercel                                                                |
| Tests      | Vitest                                                                |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/leilamahmoudi/Job-Ad-Doctor
cd job-ad-doctor
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

```
GEMINI_API_KEY=        # Google AI Studio → https://aistudio.google.com/apikey
RESEND_API_KEY=        # Resend dashboard → https://resend.com/api-keys
RESEND_FROM_EMAIL=onboarding@resend.dev   # use this for local/prototype; replace with verified domain in prod
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  page.tsx                  # 3-step flow controller
  api/
    analyse/route.ts        # LLM call 1: diagnosis JSON
    rewrite/route.ts        # LLM call 2: three rewrites
    send-rewrite/route.ts   # Resend email delivery
components/
  steps/
    StepInput.tsx           # Step 1: paste job ad + optional company context
    StepDiagnosis.tsx       # Step 2: 8 diagnosis cards (flagged first)
    StepRewrite.tsx         # Step 3: tone picker + rewrite + email
  DiagnosisCard.tsx
  TonePicker.tsx
  ProgressIndicator.tsx
  LoadingState.tsx
lib/
  gemini.ts                 # Gemini client with model fallback cascade
  prompts.ts                # All prompt strings
  types.ts                  # Shared TypeScript types
  validate-diagnosis.ts     # LLM response shape validator
  rate-limit.ts             # In-memory rate limiter (see Production notes)
  email-template.ts         # HTML email builder
__tests__/
  rate-limit.test.ts
  validate-diagnosis.test.ts
  validate-input.test.ts
```

---

## Diagnosis categories

The LLM checks for eight weaknesses — each is either flagged or clean:

| Category                 | What it catches                                                 |
| ------------------------ | --------------------------------------------------------------- |
| Generic language         | "Fast-paced", "rockstar", "ninja", filler buzzwords             |
| Weak employer branding   | No personality — could be any company                           |
| Unclear role             | Vague duties, no outcomes or ownership signals                  |
| Bias risks               | Gendered language, unnecessary degree requirements, age signals |
| Unrealistic requirements | Laundry list of skills no single person has                     |
| Missing value prop       | What the company needs, not what the candidate gets             |
| Compensation opacity     | No salary range                                                 |
| Corporate tone           | Legal-department prose, passive voice, HR-speak                 |

---

## Running tests

```bash
npm test
```

Tests cover the three pure, high-risk library functions: rate limiter, LLM response validator, and API input validator.

---

## Production notes

| Concern          | Current (prototype)                      | Production                           |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| Rate limiting    | In-memory Map — resets on server restart | Upstash Redis + `@upstash/ratelimit` |
| Email domain     | `onboarding@resend.dev`                  | Verified custom domain in Resend     |
| LLM cost control | Per-request, no caching                  | Cache diagnosis by job ad hash       |
| Error monitoring | Console logs                             | Sentry or similar                    |
| Abuse prevention | Rate limit only                          | Cloudflare WAF                       |
