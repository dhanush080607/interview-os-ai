import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { CandidateCard } from "@/components/interview/CandidateCard";
import { candidates } from "@/lib/interview/data";
import { clearInterview, newSessionId, saveInterview } from "@/lib/interview/client";
import type { Candidate } from "@/types/interview";

const TITLE = "Select a Candidate — InterviewOS";
const DESC =
  "Choose a 31-day AI cohort learner and start a personalized technical interview built from their completed, attempted and skipped missions.";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  function select(candidate: Candidate) {
    setBusy(true);
    clearInterview();
    saveInterview({
      sessionId: newSessionId(),
      candidateId: candidate.id,
      messages: [],
      progress: null,
      memory: null,
      done: false,
      feedback: null,
      assessment: null,
      engine: "deterministic",
    });
    void navigate({ to: "/interview" });
  }

  return (
    <main className="hero-glow min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Select a candidate
        </motion.h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Each interview is built from that learner's real cohort journey — completed missions,
          unfinished attempts and skipped topics.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c, i) => (
            <CandidateCard key={c.id} candidate={c} index={i} onSelect={select} busy={busy} />
          ))}
        </div>
      </div>
    </main>
  );
}