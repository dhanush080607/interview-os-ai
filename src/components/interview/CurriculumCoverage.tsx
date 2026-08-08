import { Check, Circle } from "lucide-react";
import type { InterviewMemory } from "@/types/interview";

interface Props {
  memory: InterviewMemory | null;
}

export function CurriculumCoverage({ memory }: Props) {
  return (
    <section className="glass rounded-2xl p-4" aria-label="Curriculum coverage">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Curriculum coverage
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {memory?.covered.length ? (
          memory.covered.map((c) => (
            <li key={c.day} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
              <span className="truncate">
                <span className="text-muted-foreground">Day {c.day}</span> {c.title}
              </span>
            </li>
          ))
        ) : (
          <li className="text-muted-foreground">Coverage appears as you answer.</li>
        )}
        {memory?.notAssessed.slice(0, 2).map((t) => (
          <li key={t} className="flex items-center gap-2 text-muted-foreground">
            <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}