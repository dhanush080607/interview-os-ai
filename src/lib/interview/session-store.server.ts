import type { InterviewSession } from "@/types/interview";

/**
 * In-memory session store keyed by sessionId.
 * The hackathon build intentionally avoids a database; sessions are ephemeral.
 */
const globalRef = globalThis as unknown as { __interviewSessions?: Map<string, InterviewSession> };

export const sessions: Map<string, InterviewSession> =
  globalRef.__interviewSessions ?? new Map<string, InterviewSession>();

globalRef.__interviewSessions = sessions;

const MAX_AGE_MS = 1000 * 60 * 60 * 6;

export function getSession(id: string): InterviewSession | undefined {
  const s = sessions.get(id);
  if (s && Date.now() - s.createdAt > MAX_AGE_MS) {
    sessions.delete(id);
    return undefined;
  }
  return s;
}

export function saveSession(session: InterviewSession): void {
  sessions.set(session.sessionId, session);
}