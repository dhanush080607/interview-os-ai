# InterviewOS — Your AI Technical Interviewer

Learn it. Build it. Explain it.

InterviewOS conducts an adaptive technical interview built from a learner's real 31-day AI cohort
journey, then produces a structured technical assessment and a personalized learning plan.

## Problem statement
Problem Statement 2 — The Interview Agent. The principle is *build the interviewer, not the
interview*: no fixed question list, everything is derived from candidate data + curriculum.

## Features
- Candidate selection from `candidates.json` (completed / attempted / skipped missions, signals)
- Journey analysis producing a per-candidate interview strategy
- Curriculum-aware questioning across ≥ 4 distinct days of `curriculum.json`
- Six-level depth ladder: concept → understanding → implementation → trade-off → production → architecture
- Answer grading and adaptive follow-ups that quote the candidate's own words
- Context probes that revisit earlier answers at greater scale
- Live progress, curriculum coverage and interview memory panels
- Scored assessment (derived from answers, never random) + 7-day learning plan
- Deterministic fallback engine — the product works with no AI provider configured

## Architecture
```
src/routes/api/interview.ts        POST /api/interview (contract + session lifecycle)
src/lib/interview/engine.ts        analysis, grading, question selection, feedback
src/lib/interview/questions.ts     topic question banks + generic curriculum ladder
src/lib/interview/provider.server  AI provider (Lovable AI Gateway) -> deterministic fallback
src/lib/interview/session-store    in-memory sessions keyed by sessionId
src/lib/interview/data.ts          curriculum + candidate access
src/components/interview/*         UI components
src/routes/{index,candidates,interview,feedback}.tsx
```

## Interview flow
journey analysis → strategy → question → answer → grading → follow-up or new curriculum area →
context probe → completion (≥ 8 questions, ≥ 4 curriculum days) → structured feedback.

## API
See [`technical-spec.md`](./technical-spec.md) for the full `POST /api/interview` contract.

## Setup
```bash
npm install
npm run dev      # http://localhost:8080
```

## Environment variables
| Name | Required | Purpose |
| --- | --- | --- |
| `LOVABLE_API_KEY` | no | Enables AI phrasing of interviewer turns. Without it the deterministic engine runs. |

No keys are read in client code.

## Demo
1. Open `/` → Start Interview
2. Pick a candidate on `/candidates`
3. Answer on `/interview`; watch coverage, memory and depth change with your answers
4. After 8+ questions and 4+ curriculum days you land on `/feedback`
5. Restart Interview issues a fresh sessionId

## Tech stack
React 19, TypeScript, TanStack Start/Router, Tailwind CSS v4, shadcn/ui, Lucide React, Framer Motion, Zod.

## Screenshots
_Add captures of the landing, interview workspace and assessment screens here._

## Hackathon notes
`curriculum.json`, `candidates.json` and `technical-spec.md` were not present in the workspace, so
they were authored from the build brief and live in `data/` (and `src/data/` for bundling). Swap in
the official files with the same shape and the app continues to work unchanged.
