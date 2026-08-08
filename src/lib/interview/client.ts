import type {
  InterviewApiResponse,
  InterviewAssessment,
  InterviewFeedback,
  InterviewMemory,
  InterviewProgress,
} from "@/types/interview";

export interface ChatMessage {
  id: string;
  role: "interviewer" | "candidate";
  text: string;
  day?: number;
  dayTitle?: string;
  level?: number;
}

export interface PersistedInterview {
  sessionId: string;
  candidateId: string;
  messages: ChatMessage[];
  progress: InterviewProgress | null;
  memory: InterviewMemory | null;
  done: boolean;
  feedback: InterviewFeedback | null;
  assessment: InterviewAssessment | null;
  engine: "ai" | "deterministic";
}

const KEY = "interviewos:state";

export function newSessionId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `ios_${rand}`;
}

export function loadInterview(): PersistedInterview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedInterview) : null;
  } catch {
    return null;
  }
}

export function saveInterview(state: PersistedInterview): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the interview still works in-memory */
  }
}

export function clearInterview(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export class InterviewApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function postInterview(body: {
  sessionId: string;
  candidate?: { id: string };
  message?: string;
}): Promise<InterviewApiResponse> {
  let res: Response;
  try {
    res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new InterviewApiError("Network error. Check your connection.", "network_error", 0);
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new InterviewApiError("The interviewer returned an unreadable response.", "bad_response", res.status);
  }

  if (!res.ok) {
    const err = data as { error?: string; message?: string };
    throw new InterviewApiError(
      err.message ?? "The interviewer could not process that.",
      err.error ?? "api_error",
      res.status,
    );
  }

  const payload = data as InterviewApiResponse;
  if (typeof payload.reply !== "string" || typeof payload.done !== "boolean") {
    throw new InterviewApiError("Invalid response structure from the interview API.", "invalid_structure", res.status);
  }
  return payload;
}