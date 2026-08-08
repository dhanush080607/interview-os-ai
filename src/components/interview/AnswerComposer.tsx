import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Loader2, Send } from "lucide-react";

interface Props {
  onSubmit: (text: string) => void;
  loading: boolean;
  disabled?: boolean;
  questionKey: string;
}

const MAX = 2000;

export function AnswerComposer({ onSubmit, loading, disabled, questionKey }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && !disabled) ref.current?.focus();
  }, [loading, disabled, questionKey]);

  function submit() {
    const text = value.trim();
    if (!text) {
      setError("Please write an answer before submitting.");
      ref.current?.focus();
      return;
    }
    setError(null);
    setValue("");
    onSubmit(text);
  }

  return (
    <form
      className="glass rounded-2xl p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer"
        ref={ref}
        value={value}
        maxLength={MAX}
        rows={4}
        disabled={loading || disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "answer-error" : "answer-hint"}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Explain your reasoning, implementation, and trade-offs..."
        className="w-full resize-y bg-transparent px-2 py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p id="answer-hint" className="text-xs text-muted-foreground">
          <span className="tabular-nums">{value.length}</span>/{MAX}
          <span className="ml-2 hidden sm:inline">
            <CornerDownLeft className="mr-1 inline h-3 w-3" aria-hidden />
            Ctrl/⌘ + Enter to submit
          </span>
        </p>
        <button
          type="submit"
          disabled={loading || disabled}
          className="bg-gradient-accent inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          Submit Answer
        </button>
      </div>
      {error && (
        <p id="answer-error" role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}