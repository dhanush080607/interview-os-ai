import type { InterviewMemory } from "@/types/interview";
import { topicLabel } from "@/lib/interview/data";

export function InterviewMemoryPanel({ memory }: { memory: InterviewMemory | null }) {
  return (
    <section className="glass rounded-2xl p-4" aria-label="Interview memory">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Interview memory
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {memory?.covered.map((c) => (
          <li
            key={c.day}
            className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs"
          >
            {topicLabel(c.topic)}
          </li>
        )) ?? null}
        {!memory?.covered.length && (
          <li className="text-sm text-muted-foreground">Nothing assessed yet.</li>
        )}
      </ul>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-border bg-secondary/40 py-2">
          <dd className="text-lg font-semibold text-success">{memory?.strongSignals ?? 0}</dd>
          <dt className="text-[11px] text-muted-foreground">Strong signals</dt>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 py-2">
          <dd className="text-lg font-semibold text-warning">{memory?.needsProbing ?? 0}</dd>
          <dt className="text-[11px] text-muted-foreground">Needs probing</dt>
        </div>
      </dl>
      {memory?.notAssessed.length ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Not assessed: {memory.notAssessed.join(", ")}
        </p>
      ) : null}
    </section>
  );
}