import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Target, Terminal } from "lucide-react";

const TITLE = "InterviewOS — Your AI Technical Interviewer";
const DESC =
  "InterviewOS turns your 31-day AI cohort learning journey into an adaptive technical interview with structured feedback and a personalized learning plan.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Landing,
});

const BENEFITS = [
  {
    icon: Target,
    title: "Personalized",
    body: "Questions come from the curriculum days you actually completed, attempted or skipped.",
  },
  {
    icon: Sparkles,
    title: "Adaptive",
    body: "Every follow-up is chosen from your last answer — depth rises when you're strong.",
  },
  {
    icon: Compass,
    title: "Actionable",
    body: "Finish with scored dimensions, concrete gaps and a seven-day learning plan.",
  },
];

function Landing() {
  return (
    <main className="hero-glow min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
        >
          <Terminal className="h-3.5 w-3.5 text-primary" aria-hidden />
          InterviewOS · 31-Day AI Cohort
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
        >
          Your <span className="text-gradient">AI Technical Interviewer</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5 max-w-xl text-lg text-muted-foreground"
        >
          Turn your learning journey into interview readiness. Learn it. Build it. Explain it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-9"
        >
          <Link
            to="/candidates"
            className="bg-gradient-accent inline-flex min-h-12 items-center gap-2 rounded-xl px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Interview
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>

        <ul className="mt-20 grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.li
              key={b.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <b.icon className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="mt-4 text-base font-semibold">{b.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  );
}
