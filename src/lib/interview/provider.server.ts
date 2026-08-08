import type { InterviewQuestion, InterviewSession } from "@/types/interview";
import { acknowledgement } from "./engine";

/**
 * AI Interview Provider
 *   -> Real AI provider (Lovable AI Gateway), when a key is configured
 *   -> Deterministic fallback interview engine, always available
 *
 * The deterministic engine always decides *what* to ask (curriculum coverage,
 * depth ladder, follow-up strategy). The AI provider only phrases the turn,
 * so the interview stays valid even with no provider available.
 */
export interface Turn {
  reply: string;
  engine: "ai" | "deterministic";
}

export function deterministicTurn(session: InterviewSession, question: InterviewQuestion): Turn {
  const last = session.answers[session.answers.length - 1];
  const ack = last ? `${acknowledgement(last.quality)} ` : "";
  return { reply: `${ack}${question.text}`, engine: "deterministic" };
}

export async function generateTurn(
  session: InterviewSession,
  question: InterviewQuestion,
): Promise<Turn> {
  const fallback = deterministicTurn(session, question);
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallback;

  const last = session.answers[session.answers.length - 1];
  const transcript = session.questionsAsked
    .slice(-4)
    .map((q, i) => {
      const a = session.answers[session.answers.length - 4 + i];
      return `Interviewer: ${q.text}\nCandidate: ${a?.text ?? "(pending)"}`;
    })
    .join("\n");

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are Alex, a senior AI technical interviewer. Rewrite the planned question as one natural, concise interviewer turn (max 45 words). " +
              "Keep the exact technical intent of the planned question. If the candidate's last answer is given, reference it briefly and specifically. " +
              "No preamble, no bullet points, no reasoning, no praise inflation. Output only the interviewer's words.",
          },
          {
            role: "user",
            content:
              `Candidate: ${session.candidate.name}, ${session.candidate.title}.\n` +
              `Recent transcript:\n${transcript || "(interview just started)"}\n` +
              `Candidate's last answer quality: ${last?.quality ?? "n/a"}.\n` +
              `Planned question (day ${question.day}, ${question.dayTitle}, depth level ${question.level}): ${question.text}`,
          },
        ],
        max_tokens: 160,
      }),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 12) return fallback;
    return { reply: text, engine: "ai" };
  } catch {
    return fallback;
  }
}