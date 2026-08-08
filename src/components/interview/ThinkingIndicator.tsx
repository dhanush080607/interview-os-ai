import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="bg-gradient-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
        <Bot className="h-4 w-4" aria-hidden />
      </div>
      <div className="glass rounded-2xl px-4 py-3">
        <p className="text-sm font-medium">Alex is thinking…</p>
        <p className="text-xs text-muted-foreground">Analyzing your response</p>
        <div className="mt-2 flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}