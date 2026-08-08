# InterviewOS — Technical Specification (API Contract)

## POST /api/interview

Single endpoint driving the whole interview. `Content-Type: application/json`.

### Request

First request (starts a session):
```json
{ "sessionId": "unique-session-id", "candidate": { "id": "sarah-chen" } }
```

Subsequent requests (candidate answers):
```json
{ "sessionId": "unique-session-id", "message": "candidate answer" }
```

Validation: `sessionId` required (1–120 chars). `candidate` optional object
(`id` matches `candidates.json`; defaults to the first candidate).
`message` optional string (max 6000) and required for a non-first request.

### Response — interview in progress (200)

```json
{
  "sessionId": "unique-session-id",
  "reply": "interviewer message + question",
  "done": false,
  "question": { "id": "…", "text": "…", "day": 11, "dayTitle": "RAG Pipelines",
                "topic": "rag", "level": 3, "kind": "primary|followup|context-probe" },
  "progress": { "questionNumber": 3, "questionsAsked": 3, "minQuestions": 8,
                "daysCovered": [7, 8, 11], "minDays": 4 },
  "memory": { "covered": [], "strongSignals": 2, "needsProbing": 1, "notAssessed": [] },
  "candidate": { "id": "…", "name": "…", "title": "…", "avatarInitials": "…" },
  "engine": "ai" 
}
```

### Response — interview complete (200)

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": { "summary": "string", "strengths": [], "gaps": [], "next": [] },
  "assessment": { "overallScore": 82, "headline": "…", "dimensions": [], "learningPlan": [] }
}
```

Completion requires **≥ 8 questions answered** and **≥ 4 distinct curriculum days**.

### Errors

`400 invalid_json | invalid_request | empty_answer`, `404 invalid_session | missing_candidate`,
`500 engine_error`. Shape: `{ "error": "code", "message": "human readable" }`.

### Session state (in memory, keyed by sessionId)

sessionId, candidate, questionsAsked, answers, curriculumDaysCovered, topicsCovered,
currentTopic, currentDifficulty, answerQuality, followUpsAsked, strengths, gaps,
nextSteps, questionCount, done.
