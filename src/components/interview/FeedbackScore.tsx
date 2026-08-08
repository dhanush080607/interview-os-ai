import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import type { FeedbackDimension } from "@/types/interview";

export function FeedbackScore({
  score,
  headline,
  dimensions,
}: {
  score: number;
  headline: string;
  dimensions: FeedbackDimension[];
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.1, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [count, rounded, score]);

  return (
    <section className="glass rounded-3xl p-6 sm:p-8" aria-label="Overall assessment">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Interview complete
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <p className="text-gradient text-6xl font-semibold tabular-nums">{display}</p>
        <p className="pb-2 text-lg text-muted-foreground">/ 100</p>
      </div>
      <h2 className="mt-1 text-xl font-semibold">{headline}</h2>

      <ul className="mt-6 space-y-3">
        {dimensions.map((d, i) => (
          <li key={d.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span>{d.name}</span>
              <span className="tabular-nums text-muted-foreground">{d.score}</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={d.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={d.name}
            >
              <motion.div
                className="bg-gradient-accent h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${d.score}%` }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.08 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}