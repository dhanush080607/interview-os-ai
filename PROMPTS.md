# AI Usage Log — InterviewOS

## 1. Project Planning
Prompt: master build prompt for InterviewOS (Problem Statement 2: The Interview Agent),
specifying product, API contract, adaptive engine, UI and quality bar.

## 2. Data Foundation
The referenced `curriculum.json` / `candidates.json` / `technical-spec.md` were not present in
the workspace, so they were generated from the prompt's description (31-day AI cohort, four
learners with completed/attempted/skipped missions) and are the source of truth for the build.

## 3. Interview API
Prompt: implement `POST /api/interview` exactly per the spec — zod validation, sessionId-keyed
state, non-completed and completed response shapes, explicit error codes.

## 4. Adaptive Interview Logic
Prompt: build a deterministic engine with candidate journey analysis, a six-level depth ladder,
answer grading (strong/good/partial/weak/incorrect/unclear) and curriculum coverage tracking.

## 5. Follow-up and Context Logic
Prompt: follow-ups must quote the candidate's own words; add periodic context probes that
reference an earlier answer and re-test the same reasoning at scale.

## 6. Provider Abstraction
Prompt: keep an AI provider layer (Lovable AI Gateway) that only *phrases* the turn, with the
deterministic engine always deciding what to ask, so the demo never depends on an external key.

## 7. Feedback System
Prompt: derive scores from actual answers (no random values), produce summary/strengths/gaps/next
plus scored dimensions and a seven-day learning plan.

## 8. UI Implementation
Prompt: dark-first premium interface — landing, candidate selection, interview workspace with
progress, curriculum coverage and interview memory panels, and an assessment screen.

## 9. Testing and Fixes
Prompt: run a full scripted interview against the API, verify 8+ questions, 4+ curriculum days,
adaptive follow-ups and the completed response shape; fix type errors found in the process.
