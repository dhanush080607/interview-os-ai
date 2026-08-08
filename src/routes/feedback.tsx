import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ListChecks, RotateCw, TriangleAlert } from "lucide-react";
import { FeedbackScore } from "@/components/interview/FeedbackScore";
import { FeedbackSection } from "@/components/interview/FeedbackSection";
import { LearningPlan } from "@/components/interview/LearningPlan";
import { clearInterview, loadInterview, type PersistedInterview } from "@/lib/interview/client";

const TITLE = "Interview Assessment — InterviewOS";
const DESC =
  "Your technical interview assessment: scored dimensions, demonstrated strengths, concrete gaps and a seven-day learning plan.";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<PersistedInterview | null>(null);

  useEffect(() => {
    const s = loadInterview();
    if (!s || !s.done || !s.feedback) {
      void navigate({ to: "/candidates" });
      return;
    }
    setState(s);
  }, [navigate]);

  if (!state?.feedback) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading assessment…</p>
      </main>
    );
  }

  const { feedback, assessment } = state;

  return (
    <main className="hero-glow min-h-screen">
      <div className="mx-auto max-w-4xl space-y-5 px-5 py-12">
        <FeedbackScore
          score={assessment?.overallScore ?? 0}
          headline={assessment?.headline ?? "Technical Assessment"}
          dimensions={assessment?.dimensions ?? []}
        />

        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Summary
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed">{feedback.summary}</p>
        </section>

        <FeedbackSection
          title="Strengths"
          tone="success"
          delay={0.05}
          icon={<CheckCircle2 className="h-4 w-4 text-success" aria-hidden />}
          items={feedback.strengths}
        />
        <FeedbackSection
          title="Gaps"
          tone="warning"
          delay={0.1}
          icon={<TriangleAlert className="h-4 w-4 text-warning" aria-hidden />}
          items={feedback.gaps}
        />
        <FeedbackSection
          title="Next Steps"
          delay={0.15}
          icon={<ListChecks className="h-4 w-4 text-primary" aria-hidden />}
          items={feedback.next}
        />

        {assessment?.learningPlan.length ? <LearningPlan steps={assessment.learningPlan} /> : null}

        <div className="flex flex-wrap gap-3 pb-8">
          <button
            type="button"
            onClick={() => {
              clearInterview();
              void navigate({ to: "/candidates" });
            }}
            className="bg-gradient-accent inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            Restart Interview
          </button>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 text-sm transition-colors hover:bg-secondary"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}