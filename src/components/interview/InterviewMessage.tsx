import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import type { ChatMessage } from "@/lib/interview/client";

export function InterviewMessage({ message }: { message: ChatMessage }) {
  const isInterviewer = message.role === "interviewer";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex gap-3 ${isInterviewer ? "" : "justify-end"}`}
    >
      {isInterviewer && (
        <div className="bg-gradient-accent mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
          <Bot className="h-4 w-4" aria-hidden />
        </div>
      )}
      <div className={`max-w-[85%] ${isInterviewer ? "" : "text-right"}`}>
        <p className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          {isInterviewer ? "Alex · AI Technical Interviewer" : "You"}
          {isInterviewer && message.dayTitle ? ` · Day ${message.day} ${message.dayTitle}` : ""}
        </p>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isInterviewer
              ? "glass text-foreground"
              : "border border-border bg-secondary/70 text-secondary-foreground"
          }`}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}