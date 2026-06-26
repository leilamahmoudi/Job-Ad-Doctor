# Project Owner Expectations & Product Definition

> Single source of truth for what the Job Ad Doctor is trying to achieve, who it's for, and what good/bad looks like. Every role's quality bar is held against this document. Any product decision that contradicts a section here requires a conscious update — not a silent drift.

---

## 1. Who Is This For

Three user types, all valid — the tool must feel relevant to each:

- **Hiring manager at a mid-size company (50–500 people)** — writes job ads themselves, no dedicated recruiter, frustrated that good candidates don't apply, may not yet use an ATS
- **In-house recruiter at a larger company** — high volume, experienced, evaluating tools that make their output better faster
- **Founder hiring their first or second employee** — no prior job ad experience, highly motivated to get it right, high pain

What unites all three: they are **actively hiring right now**. Pasting a live job ad is the strongest intent signal we can capture.

---

## 2. Why Job Ads Are Broken (Root Cause)

Three causes that compound each other:

1. **Writers don't know what candidates want** — hiring managers write for themselves or for HR compliance, not for the person reading. They optimise for covering requirements, not for attracting the right person.
2. **Everyone copies the same templates** — job ads are copy-pasted from previous postings or generic templates. No one questions whether the template ever worked. Mediocrity compounds.
3. **No feedback loop exists** — a bad ad gets 5 applicants instead of 50 and nobody connects the two. Without feedback, nothing improves.

The Job Ad Doctor breaks all three at once: it names what's wrong (feedback), explains why (education), and rewrites it (template replacement).

---

## 3. What Is a Good Job Ad

A good job ad achieves all three simultaneously:

1. **The right person applies and the wrong person self-selects out** — specificity does both jobs. Vague ads attract everyone and filter no one.
2. **The candidate pictures themselves succeeding in the role** — describes outcomes, not just duties. The reader finishes and thinks "I could do that, and I'd be good at it."
3. **The company feels worth joining, not just the role** — culture and team come through as specifics, not adjectives. You want to work *there*, not just in *that role*.

These three outcomes are the quality bar every rewrite must be held to.

---

## 4. What Is a Bad Job Ad (Weakness Categories)

Eight diagnosable weaknesses — these map directly to the LLM output schema. Each is either **flagged or clean** (no severity levels — present/absent only):

| # | Schema Key | Plain-English Label | Description |
|---|------------|-------------------|-------------|
| 1 | `generic_language` | Generic language & buzzwords | "Fast-paced", "rockstar", "ninja", "passionate" — filler that signals nothing |
| 2 | `weak_employer_branding` | Weak employer branding | No company personality or culture signal — could be any company |
| 3 | `unclear_role` | Unclear role & responsibilities | No outcomes, no ownership signals, vague duties |
| 4 | `bias_risks` | Bias risks | Gendered language, unnecessary degree requirements, age signals |
| 5 | `unrealistic_requirements` | Unrealistic requirements | Laundry-list of skills no one human has; signals the company doesn't know what it needs |
| 6 | `missing_value_prop` | Missing candidate value proposition | Explains what you must bring but not what you get — growth, impact, flexibility, comp |
| 7 | `compensation_opacity` | No compensation range | Hiding salary is increasingly a trust signal against the company |
| 8 | `corporate_tone` | Overly formal / corporate tone | Legal-department prose, passive voice, HR-speak — makes the company feel cold |

**Diagnosis card format** (per flagged category):
- **Label** — plain-English name (from table above)
- **Explanation** — 1 sentence specific to what was found in this ad (not generic advice)
- **Fix hint** — one-line direction, e.g. "Try: 'We're looking for someone who has shipped X and can do Y'"

Clean categories are shown dimmed — present but visually de-emphasised, not hidden.

---

## 5. Tone of Voice

**The tool's own voice (fixed):** Knowledgeable friend, not a consultant. Speaks plainly, uses "you", gives direct opinions without hedging. Like a colleague who happens to know a lot about hiring copy saying "this part isn't working, here's why." Never clinical, never patronising.

**The rewritten job ad's tone (user-selectable, after diagnosis):**
Three options presented as a refinement step — not upfront configuration:

| Option | Description |
|--------|-------------|
| **Direct & confident** | Clear, punchy, no fluff |
| **Warm & human** | Conversational, inviting, personality-forward |
| **Professional & structured** | Formal but specific, suitable for regulated industries |

Default: **Warm & human** — broadest appeal across all three user types.

---

## 6. The User Journey

**Layout: 3-step mobile-first flow.** Each step fills the full mobile viewport. No horizontal scroll, no desktop-first shrinking. Progress indicator shows current step.

---

### Step 1 — Input

**Hero headline:** "Your job ad, rewritten by an expert — in seconds."

```
[ Company name (optional)              ]
[ What does your company do? (optional)]  ← one line, e.g. "B2B SaaS for HR teams"

[ Paste your job ad here...            ]
[                                      ]
[                                      ]
[ Analyse my job ad →                  ]
```

Company context is optional but improves employer branding diagnosis and rewrite specificity. If omitted, the LLM infers from the ad content.

**LLM Call 1** fires on submit → diagnosis JSON (~3–5s).

---

### Step 2 — Diagnosis

8 category cards. Each flagged card shows: label + 1-sentence explanation specific to this ad + one-line fix hint. Clean cards shown dimmed.

```
[ ❌ Generic language        ]
  "Phrases like 'fast-paced' appear 3×..."
  → Try: "We ship every two weeks and ..."

[ ✅ Bias risks              ]  ← dimmed

[ ❌ Weak employer branding  ]
  ...

[ See the rewrite →          ]
```

---

### Step 3 — Rewrite + Email

Tone picker appears first. Selecting a tone triggers **LLM Call 2** → rewrite in chosen tone (~5–10s).

```
How should your rewrite sound?
[ Direct & confident ]  [ Warm & human* ]  [ Professional ]

[  Full rewritten job ad renders here  ]

─────────────────────────────────────
Want this sent to your inbox?

[ your@email.com                       ]
No spam. We'll send your rewrite once.
[ Send to my inbox →                   ]
─────────────────────────────────────
```

*Default tone: Warm & human.* No follow-up opt-in — the email is used solely to deliver the rewrite. Email is sent via **Resend** (free tier, real delivery).

---

Full value (diagnosis + rewrite) is always visible. The email step is a convenience offer, never a gate.

---

## 7. Error States & Input Boundaries

| Scenario | Validation | Message shown |
|----------|-----------|---------------|
| Empty textarea | Client-side | "Paste your job ad above to get started." |
| Not a job ad | LLM detects + returns flag | "This doesn't look like a job ad. Try pasting the full posting." |
| LLM failure / timeout | API error catch | "Something went wrong on our end. Your job ad is still here — [Try again]" |
| Rate limiting / abuse | Server-side (max N requests per IP per hour) | "You've hit the limit. Try again in a bit." |
| Illegal job ad content | System prompt strict rejection | LLM returns a flag; UI shows: "We can't analyse this ad." |
| Prompt injection attempt | System prompt hardened against override | LLM ignores; normal error shown |

The system prompt is the first line of defence against misuse. It is written to be strict, scoped, and resistant to override — the model should refuse any instruction that falls outside job ad analysis and rewriting.

---

## 8. What Success Looks Like

| Metric | Type | Definition |
|--------|------|------------|
| Email capture rate | **North star** | % of users who complete the flow and submit their email |
| Rewrite completion rate | **Health metric** | % of users who reach the rewrite (paste → full output) |

A high rewrite completion rate with a low email capture rate means the tool delivers value but the capture moment needs work. Both numbers together tell the full story.

---

## 9. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM call structure | Two calls | Call 1: diagnosis only (~3–5s). Call 2: rewrite on tone selection (~5–10s). User gets first feedback fast; tone picker is meaningful because it triggers a real call. |
| Email delivery | Resend (free tier) | Real end-to-end delivery. ~30min to integrate. Makes the demo credible. 100 emails/day free. |
| Severity scoring | Present / absent | Simpler schema, more consistent LLM output. Severity can be added in v2. |
| Layout | 3-step mobile-first | Each step fills the mobile viewport. No scroll management. Progress feels intentional. |
