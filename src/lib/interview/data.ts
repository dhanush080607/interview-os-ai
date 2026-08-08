import curriculumJson from "@/data/curriculum.json";
import candidatesJson from "@/data/candidates.json";
import type { Candidate, Curriculum, CurriculumDay } from "@/types/interview";

export const curriculum = curriculumJson as Curriculum;
export const candidates = (candidatesJson as { candidates: Candidate[] }).candidates;

export function getCandidate(id: string | undefined | null): Candidate | undefined {
  if (!id) return undefined;
  return candidates.find((c) => c.id === id);
}

export function getDay(day: number): CurriculumDay | undefined {
  return curriculum.days.find((d) => d.day === day);
}

export function topicLabel(topic: string): string {
  const map: Record<string, string> = {
    "llm-foundations": "LLM Foundations",
    "prompt-engineering": "Prompt Engineering",
    "structured-output": "Structured Output",
    chunking: "Chunking",
    embeddings: "Embeddings",
    "vector-databases": "Vector Databases",
    retrieval: "Retrieval & Ranking",
    rag: "RAG",
    evaluation: "Evaluation",
    "backend-api": "Backend & APIs",
    memory: "State & Memory",
    "tool-calling": "Tool Calling",
    agents: "Agents",
    mcp: "MCP",
    guardrails: "Guardrails",
    observability: "Observability",
    deployment: "Deployment & Scale",
    capstone: "Capstone",
    communication: "Technical Communication",
  };
  return map[topic] ?? topic;
}

export const TOPIC_DIMENSION: Record<string, string> = {
  rag: "RAG & Retrieval",
  retrieval: "RAG & Retrieval",
  embeddings: "RAG & Retrieval",
  chunking: "RAG & Retrieval",
  "vector-databases": "RAG & Retrieval",
  "prompt-engineering": "Prompt Engineering",
  "structured-output": "Prompt Engineering",
  "llm-foundations": "Prompt Engineering",
  agents: "Agent Architecture",
  "tool-calling": "Agent Architecture",
  mcp: "Agent Architecture",
  "backend-api": "Backend Engineering",
  memory: "Backend Engineering",
  deployment: "Production Thinking",
  observability: "Production Thinking",
  guardrails: "Production Thinking",
  evaluation: "Production Thinking",
  capstone: "Communication",
  communication: "Communication",
};

export const DIMENSIONS = [
  "RAG & Retrieval",
  "Prompt Engineering",
  "Agent Architecture",
  "Backend Engineering",
  "Production Thinking",
  "Communication",
];