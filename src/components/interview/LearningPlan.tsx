import { motion } from "framer-motion";

export function LearningPlan({ steps }: { steps: string[] }) {
  return (
    <section className="glass rounded-2xl p-5" aria-label="Personalized learning plan">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Your next 7 days
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            className="flex gap-3"
          >
            <span className="mt-0.5 font-mono text-xs text-primary tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed">{s}</span>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}