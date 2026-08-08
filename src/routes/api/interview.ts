import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { InterviewApiResponse, InterviewSession } from "@/types/interview";
import { candidates, getCandidate } from "@/lib/interview/data";
import {
  MIN_DAYS,
  MIN_QUESTIONS,
  analyzeCandidate,
  buildFeedback,
  buildMemory,
  gradeAnswer,
  nextQuestion,
  shouldComplete,
} from "@/lib/interview/engine";
import { generateTurn } from "@/lib/interview/provider.server";
import { getSession, saveSession } from "@/lib/interview/session-store.server";

const bodySchema = z.object({
  sessionId: z.string().min(1).max(120),
  candidate: z
    .object({ id: z.string().optional(), name: z.string().optional() })
    .passthrough()
    .optional(),
  message: z.string().max(6000).optional(),
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function progressOf(session: InterviewSession) {
  return {
    questionNumber: session.questionCount,
    questionsAsked: session.questionCount,
    minQuestions: MIN_QUESTIONS,
    daysCovered: session.curriculumDaysCovered,
    minDays: MIN_DAYS,
  };
}

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "invalid_json", message: "Request body must be valid JSON." }, 400);
        }

        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return json(
            { error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid request." },
            400,
          );
        }

        const { sessionId, candidate: candidateInput, message } = parsed.data;
        let session = getSession(sessionId);

        /* ---------------- First request: start the interview ---------------- */
        if (!session) {
          if (message && !candidateInput) {
            return json(
              { error: "invalid_session", message: "Unknown sessionId. Start a new interview." },
              404,
            );
          }
          const candidate =
            getCandidate(candidateInput?.id) ??
            candidates.find((c) => c.name === candidateInput?.name) ??
            candidates[0];
          if (!candidate) {
            return json({ error: "missing_candidate", message: "No candidate data available." }, 404);
          }

          const strategy = analyzeCandidate(candidate);
          session = {
            sessionId,
            candidate,
            strategy,
            questionsAsked: [],
            answers: [],
            curriculumDaysCovered: [],
            topicsCovered: [],
            currentTopic: "",
            currentDifficulty: 1,
            answerQuality: null,
            followUpsAsked: 0,
            strengths: strategy.primaryAreas,
            gaps: strategy.potentialGaps,
            nextSteps: [],
            questionCount: 0,
            planIndex: 0,
            done: false,
            feedback: null,
            assessment: null,
            createdAt: Date.now(),
          };

          const q = nextQuestion(session);
          if (!q) return json({ error: "engine_error", message: "Could not start interview." }, 500);

          const intro =
            `Hi ${candidate.name.split(" ")[0]}, I'm Alex. I've reviewed your 31-day cohort journey — ` +
            `${strategy.primaryAreas.slice(0, 3).join(", ") || "your completed work"} stood out. ` +
            `We'll go through your actual builds for about 8 questions. `;

          const turn = await generateTurn(session, q);
          session.questionsAsked.push(q);
          session.questionCount = 1;
          session.currentTopic = q.topic;
          session.currentDifficulty = q.level;
          saveSession(session);

          const res: InterviewApiResponse = {
            sessionId,
            reply: `${intro}${turn.reply}`,
            done: false,
            question: q,
            progress: progressOf(session),
            memory: buildMemory(session),
            candidate: {
              id: candidate.id,
              name: candidate.name,
              title: candidate.title,
              avatarInitials: candidate.avatarInitials,
            },
            engine: turn.engine,
          };
          return json(res);
        }

        /* ---------------- Already complete ---------------- */
        if (session.done && session.feedback) {
          return json({
            sessionId,
            reply: "Interview completed.",
            done: true,
            feedback: session.feedback,
            ...(session.assessment ? { assessment: session.assessment } : {}),
            progress: progressOf(session),
            memory: buildMemory(session),
          } satisfies InterviewApiResponse);
        }

        /* ---------------- Subsequent request: an answer ---------------- */
        const answerText = (message ?? "").trim();
        if (!answerText) {
          return json({ error: "empty_answer", message: "An answer is required." }, 400);
        }

        const asked = session.questionsAsked[session.questionsAsked.length - 1];
        if (!asked) return json({ error: "engine_error", message: "No pending question." }, 500);

        const graded = gradeAnswer(answerText);
        session.answers.push({
          questionId: asked.id,
          text: answerText,
          quality: graded.quality,
          score: graded.score,
          keywords: graded.keywords,
          day: asked.day,
          topic: asked.topic,
        });
        session.answerQuality = graded.quality;
        if (!session.curriculumDaysCovered.includes(asked.day)) {
          session.curriculumDaysCovered.push(asked.day);
        }
        if (!session.topicsCovered.includes(asked.topic)) session.topicsCovered.push(asked.topic);

        /* ---------------- Completion ---------------- */
        if (shouldComplete(session)) {
          const { feedback, assessment } = buildFeedback(session);
          session.done = true;
          session.feedback = feedback;
          session.assessment = assessment;
          session.strengths = feedback.strengths;
          session.gaps = feedback.gaps;
          session.nextSteps = feedback.next;
          saveSession(session);
          return json({
            sessionId,
            reply: "Interview completed.",
            done: true,
            feedback,
            assessment,
            progress: progressOf(session),
            memory: buildMemory(session),
          } satisfies InterviewApiResponse);
        }

        /* ---------------- Next adaptive question ---------------- */
        const before = session.questionsAsked[session.questionsAsked.length - 1]?.day;
        const q = nextQuestion(session);
        if (!q) {
          const { feedback, assessment } = buildFeedback(session);
          session.done = true;
          session.feedback = feedback;
          session.assessment = assessment;
          saveSession(session);
          return json({
            sessionId,
            reply: "Interview completed.",
            done: true,
            feedback,
            assessment,
            progress: progressOf(session),
            memory: buildMemory(session),
          } satisfies InterviewApiResponse);
        }

        if (q.kind === "followup") session.followUpsAsked += 1;
        else if (q.day !== before) session.followUpsAsked = 0;

        const turn = await generateTurn(session, q);
        session.questionsAsked.push(q);
        session.questionCount += 1;
        session.currentTopic = q.topic;
        session.currentDifficulty = q.level;
        saveSession(session);

        return json({
          sessionId,
          reply: turn.reply,
          done: false,
          question: q,
          progress: progressOf(session),
          memory: buildMemory(session),
          candidate: {
            id: session.candidate.id,
            name: session.candidate.name,
            title: session.candidate.title,
            avatarInitials: session.candidate.avatarInitials,
          },
          engine: turn.engine,
        } satisfies InterviewApiResponse);
      },
    },
  },
});