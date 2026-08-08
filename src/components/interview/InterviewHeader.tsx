import { Link } from "@tanstack/react-router";
import { ChevronLeft, RotateCw, Terminal } from "lucide-react";

interface Props {
  candidateName: string;
  questionNumber: number;
  minQuestions: number;
  onRestart: () => void;
}

export function InterviewHeader({ candidateName, questionNumber, minQuestions, onRestart }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link
          to="/candidates"
          aria-label="Back to candidate selection"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Terminal className="h-3 w-3 text-primary" aria-hidden />
            InterviewOS
          </p>
          <h1 className="truncate text-sm font-medium">
            Technical Interview · {candidateName}
          </h1>
        </div>
        <p className="shrink-0 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium tabular-nums">
          Question {questionNumber} / {minQuestions}+
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Restart</span>
        </button>
      </div>
    </header>
  );
}