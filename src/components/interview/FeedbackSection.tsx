import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FeedbackSection({
  title,
  icon,
  items,
  tone = "default",
  delay = 0,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone?: "default" | "success" | "warning";
  delay?: number;
}) {
  const dot =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-primary";
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="glass rounded-2xl p-5"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
            <span aria-hidden className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}