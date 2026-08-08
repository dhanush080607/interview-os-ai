import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { CurriculumCoverage } from "@/components/interview/CurriculumCoverage";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewMemoryPanel } from "@/components/interview/InterviewMemoryPanel";
import { InterviewMessage } from "@/components/interview/InterviewMessage";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { ThinkingIndicator } from "@/components/interview/ThinkingIndicator";
import {
  InterviewApiError,
  clearInterview,
  loadInterview,
  newSessionId,
  postInterview,
  saveInterview,
  type ChatMessage,
  type PersistedInterview,
} from "@/lib/interview/client";
import { getCandidate } from "@/lib/interview/data";
import { MIN_QUESTIONS } from "@/lib/interview/engine";

const TITLE = "Live Technical Interview — InterviewOS";
const DESC =
  "An adaptive, curriculum-aware technical interview: follow-up questions, depth ladder and conversational memory across your AI cohort journey.";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<PersistedInterview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const persist = useCallback((next: PersistedInterview) => {
    setState(next);
    saveInterview(next);
  }, []);

  // Bootstrap: load persisted session, or bounce back to candidate selection.
  useEffect(() => {
    const existing = loadInterview();
    if (!existing || !getCandidate(existing.candidateId)) {
      void navigate({ to: "/candidates" });
      return;
    }
    setState(existing);
  }, [navigate]);

  const start = useCallback(
    async (s: PersistedInterview) => {
      setLoading(true);
      setError(null);
      try {
        const res = await postInterview({
          sessionId: s.sessionId,
          candidate: { id: s.candidateId },
        });
        persist({
          ...s,
          messages: [
            {
              id: res.question?.id ?? "q1",
              role: "interviewer",
              text: res.reply,
              ...(res.question ? { day: res.question.day, dayTitle: res.question.dayTitle } : {}),
            },
          ],
          progress: res.progress ?? null,
          memory: res.memory ?? null,
          engine: res.engine ?? "deterministic",
        });
      } catch (e) {
        const msg = e instanceof InterviewApiError ? e.message : "Something went wrong.";
        setError(msg);
        setRetry(() => () => void start(s));
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  useEffect(() => {
    if (!state || started.current) return;
    if (state.messages.length === 0 && !state.done) {
      started.current = true;
      void start(state);
    } else {
      started.current = true;
    }
  }, [state, start]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state?.messages.length, loading]);

  const submit = useCallback(
    async (text: string, base?: PersistedInterview) => {
      const current = base ?? state;
      if (!current) return;
      const candidateMsg: ChatMessage = {
        id: `a-${current.messages.length}`,
        role: "candidate",
        text,
      };
      const optimistic = { ...current, messages: [...current.messages, candidateMsg] };
      persist(optimistic);
      setLoading(true);
      setError(null);
      try {
        const res = await postInterview({ sessionId: current.sessionId, message: text });
        if (res.done) {
          const finished: PersistedInterview = {
            ...optimistic,
            done: true,
            feedback: res.feedback ?? null,
            assessment: res.assessment ?? null,
            progress: res.progress ?? optimistic.progress,
            memory: res.memory ?? optimistic.memory,
          };
          persist(finished);
          void navigate({ to: "/feedback" });
          return;
        }
        persist({
          ...optimistic,
          messages: [
            ...optimistic.messages,
            {
              id: res.question?.id ?? `q-${optimistic.messages.length}`,
              role: "interviewer",
              text: res.reply,
              ...(res.question ? { day: res.question.day, dayTitle: res.question.dayTitle } : {}),
            },
          ],
          progress: res.progress ?? optimistic.progress,
          memory: res.memory ?? optimistic.memory,
          engine: res.engine ?? optimistic.engine,
        });
      } catch (e) {
        const msg =
          e instanceof InterviewApiError ? e.message : "We couldn't process that answer.";
        setError(msg);
        setRetry(() => () => void submit(text, current));
        persist(current);
      } finally {
        setLoading(false);
      }
    },
    [state, persist, navigate],
  );

  function restart() {
    if (!state) return;
    clearInterview();
    const fresh: PersistedInterview = {
      sessionId: newSessionId(),
      candidateId: state.candidateId,
      messages: [],
      progress: null,
      memory: null,
      done: false,
      feedback: null,
      assessment: null,
      engine: "deterministic",
    };
    persist(fresh);
    void start(fresh);
  }

  const candidate = state ? getCandidate(state.candidateId) : undefined;
  if (!state || !candidate) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading interview…</p>
      </main>
    );
  }

  const questionNumber = state.progress?.questionNumber ?? state.messages.filter((m) => m.role === "interviewer").length;
  const lastQuestionId = state.messages[state.messages.length - 1]?.id ?? "q0";
  const awaitingAnswer = state.messages[state.messages.length - 1]?.role === "interviewer";

  return (
    <div className="min-h-screen">
      <InterviewHeader
        candidateName={candidate.name}
        questionNumber={Math.max(1, questionNumber)}
        minQuestions={MIN_QUESTIONS}
        onRestart={restart}
      />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[300px_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          <section className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-accent flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold text-primary-foreground">
                {candidate.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{candidate.name}</p>
                <p className="truncate text-xs text-muted-foreground">{candidate.title}</p>
              </div>
            </div>
          </section>
          <InterviewProgress
            questionNumber={Math.max(1, questionNumber)}
            daysCovered={state.progress?.daysCovered.length ?? 0}
          />
          <CurriculumCoverage memory={state.memory} />
          <InterviewMemoryPanel memory={state.memory} />
        </aside>

        <section className="order-1 flex min-h-[60vh] flex-col lg:order-2" aria-label="Interview conversation">
          <div className="flex-1 space-y-5">
            <AnimatePresence initial={false}>
              {state.messages.map((m) => (
                <InterviewMessage key={m.id + m.role + m.text.slice(0, 8)} message={m} />
              ))}
            </AnimatePresence>
            {loading && <ThinkingIndicator />}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="alert"
                className="glass rounded-2xl border-destructive/40 p-4"
              >
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  {error}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your interview progress is safe.
                </p>
                <button
                  type="button"
                  onClick={() => retry?.()}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-secondary"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  Try Again
                </button>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="sticky bottom-0 mt-6 bg-background/80 pb-2 pt-3 backdrop-blur">
            <AnswerComposer
              questionKey={lastQuestionId}
              loading={loading}
              disabled={!awaitingAnswer || state.done}
              onSubmit={(t) => void submit(t)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}