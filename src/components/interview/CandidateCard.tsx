import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CircleDashed, RotateCcw } from "lucide-react";
import type { Candidate } from "@/types/interview";
import { topicLabel } from "@/lib/interview/data";

interface Props {
  candidate: Candidate;
  index: number;
  onSelect: (candidate: Candidate) => void;
  busy?: boolean;
}

export function CandidateCard({ candidate, index, onSelect, busy }: Props) {
  const completed = candidate.missions.filter((m) => m.status === "completed").length;
  const attempted = candidate.missions.filter((m) => m.status === "attempted").length;
  const skipped = candidate.missions.filter((m) => m.status === "skipped").length;
  const strong = Array.from(
    new Set(
      candidate.missions.filter((m) => m.status === "completed").map((m) => topicLabel(m.topic)),
    ),
  ).slice(0, 4);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="glass flex flex-col rounded-3xl p-6"
    >
      <div className="flex items-center gap-4">
        <div className="bg-gradient-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-primary-foreground">
          {candidate.avatarInitials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{candidate.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{candidate.track}</p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-success" />} value={completed} label="Completed" />
        <Stat icon={<RotateCcw className="h-4 w-4 text-warning" />} value={attempted} label="Attempts" />
        <Stat icon={<CircleDashed className="h-4 w-4 text-muted-foreground" />} value={skipped} label="Skipped" />
      </dl>

      <div className="mt-6">
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Strong areas
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {strong.map((s) => (
            <li
              key={s}
              className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
        {candidate.learningSignals.slice(0, 3).map((s) => (
          <li key={s.label} className="flex items-start gap-2">
            <span
              aria-hidden
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.type === "strength" ? "bg-success" : "bg-warning"}`}
            />
            {s.label}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(candidate)}
        disabled={busy}
        className="bg-gradient-accent mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Start Interview
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </motion.article>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 py-3">
      <dt className="sr-only">{label}</dt>
      <div className="flex items-center justify-center gap-1.5">
        {icon}
        <dd className="text-lg font-semibold">{value}</dd>
      </div>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}