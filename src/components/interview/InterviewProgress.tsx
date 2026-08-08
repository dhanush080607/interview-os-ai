import { motion } from "framer-motion";
import { MIN_DAYS, MIN_QUESTIONS } from "@/lib/interview/engine";

interface Props {
  questionNumber: number;
  daysCovered: number;
}

export function InterviewProgress({ questionNumber, daysCovered }: Props) {
  const qPct = Math.min(100, (questionNumber / MIN_QUESTIONS) * 100);
  const dPct = Math.min(100, (daysCovered / MIN_DAYS) * 100);
  return (
    <section className="glass rounded-2xl p-4" aria-label="Interview progress">
      <Bar label={`Question ${questionNumber} / ${MIN_QUESTIONS}+`} pct={qPct} />
      <div className="h-3" />
      <Bar label={`${daysCovered} / ${MIN_DAYS}+ curriculum areas`} pct={dPct} violet />
    </section>
  );
}

function Bar({ label, pct, violet }: { label: string; pct: number; violet?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className={violet ? "h-full rounded-full bg-violet" : "h-full rounded-full bg-primary"}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}