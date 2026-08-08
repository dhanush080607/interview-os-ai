import type { CurriculumDay } from "@/types/interview";
import { topicLabel } from "./data";

/**
 * Depth ladder: level 1 concept -> 6 architecture.
 * Topic-specific banks keep questions realistic; the generic ladder is
 * derived from the curriculum day itself so every day stays askable.
 */
const BANK: Record<string, string[]> = {
  rag: [
    "Walk me through what RAG actually is, in your own words.",
    "Why does grounding a model in retrieved context reduce hallucination risk?",
    "How did you implement your retrieval pipeline end to end — ingestion through answer?",
    "Why would you choose hybrid retrieval over pure vector similarity for that pipeline?",
    "What changes in that design once you're indexing millions of documents?",
    "Redesign that system for enterprise scale with freshness and access-control requirements. What's the architecture?",
  ],
  retrieval: [
    "How do you decide which documents are relevant to a query?",
    "Why does the choice of similarity metric matter for your results?",
    "How would you implement reranking on top of a top-k vector search?",
    "When is BM25 the better choice than embeddings, and why?",
    "Your recall looks fine but users complain about answer quality. How do you diagnose that?",
    "Design a retrieval layer that serves both keyword-precise and semantic queries at low latency.",
  ],
  embeddings: [
    "What does an embedding actually represent?",
    "Why do semantically similar texts end up close together in vector space?",
    "How did you decide which embedding model to use in your project?",
    "What trade-off are you accepting when you pick a smaller embedding model?",
    "You need to swap embedding models on a live index. What's your migration plan?",
    "Design an embedding strategy for mixed content: code, prose and tables.",
  ],
  "vector-databases": [
    "What problem does a vector database solve that a normal database doesn't?",
    "Why is an approximate index used instead of exact nearest-neighbour search?",
    "How would you model metadata filtering alongside vector search?",
    "HNSW or IVF for your workload — what drives that decision?",
    "What breaks when the index no longer fits in memory?",
    "Design a multi-tenant vector store with isolation and per-tenant recall guarantees.",
  ],
  chunking: [
    "How do you split documents before indexing them?",
    "Why does chunk size change answer quality?",
    "How would you implement semantic chunking for long technical docs?",
    "What's the trade-off between large chunks and precise retrieval?",
    "How do you keep chunks consistent when source documents change daily?",
    "Design a chunking and re-indexing pipeline for a 10M-document corpus.",
  ],
  "prompt-engineering": [
    "How do you structure a prompt for a production task?",
    "Why do few-shot examples change model behaviour so much?",
    "How would you implement a prompt that must return a strict format every time?",
    "When would you spend context budget on examples instead of instructions?",
    "How do you stop prompt quality regressing when the model version changes?",
    "Design a prompt management system for a team shipping dozens of prompts.",
  ],
  "structured-output": [
    "How do you get reliable structured output from a model?",
    "Why is schema validation still needed when using JSON mode?",
    "How would you implement a repair loop for invalid model output?",
    "Strict schemas versus flexible output — what do you give up either way?",
    "How do you handle schema-valid but semantically wrong output in production?",
    "Design an output contract layer shared across many AI endpoints.",
  ],
  "llm-foundations": [
    "What is a context window and why does it constrain your design?",
    "Why does temperature change the reliability of your system?",
    "How would you estimate the token cost of a single user request?",
    "Bigger model or better retrieval — how do you decide where to spend?",
    "What happens to your latency profile under concurrent load?",
    "Design a model routing layer that balances cost, latency and quality.",
  ],
  agents: [
    "What makes a system an agent rather than a single model call?",
    "Why does a reason-act-observe loop help on multi-step tasks?",
    "How did you implement the control loop and stop conditions in your agent?",
    "Single agent with many tools, or multiple specialised agents — what's the trade-off?",
    "How do you stop an agent burning cost in a loop in production?",
    "Design a multi-agent system with handoffs, shared memory and failure recovery.",
  ],
  "tool-calling": [
    "How does a model actually call a tool?",
    "Why does the tool schema matter as much as the prompt?",
    "How would you validate and execute tool arguments safely?",
    "What's the trade-off between many narrow tools and few broad ones?",
    "How do you handle a tool that fails or times out mid-run?",
    "Design a tool registry with permissions, versioning and auditing.",
  ],
  mcp: [
    "What is the Model Context Protocol trying to standardise?",
    "Why does a protocol layer help compared with bespoke tool integrations?",
    "How would you implement an MCP server exposing tools and resources?",
    "What do you gain and lose by putting your tools behind MCP?",
    "How do you handle auth and lifecycle for MCP tools in production?",
    "Design an MCP layer that serves multiple client applications safely.",
  ],
  evaluation: [
    "How do you know your AI feature is actually working?",
    "Why is faithfulness measured separately from relevance?",
    "How would you build a golden dataset and run it in CI?",
    "Offline eval versus production feedback — where do you invest first?",
    "How would you detect a quality regression after a model upgrade?",
    "Design an evaluation system covering retrieval, generation and end-user outcomes.",
  ],
  "backend-api": [
    "How do you design the API contract for an AI endpoint?",
    "Why do AI endpoints need different timeout and retry handling?",
    "How did you implement streaming responses for your app?",
    "Streaming versus buffered responses — what does each cost you?",
    "How do you protect your provider quota under a traffic spike?",
    "Design the backend for an AI product with 10k concurrent sessions.",
  ],
  memory: [
    "How do you keep conversation state across requests?",
    "Why does unbounded history eventually break the system?",
    "How would you implement summarised memory for long sessions?",
    "Window memory versus summary memory — what's the trade-off?",
    "How do you avoid leaking one user's context into another session?",
    "Design a memory layer with recall, summarisation and expiry.",
  ],
  guardrails: [
    "What kinds of input do you need to defend against?",
    "Why is prompt injection hard to fully prevent?",
    "How would you implement input and output filtering around a model call?",
    "Strict filtering hurts legitimate users — how do you balance that?",
    "How do you monitor guardrail effectiveness in production?",
    "Design a policy enforcement layer for a multi-tenant AI product.",
  ],
  observability: [
    "What would you trace in an AI application?",
    "Why are token counts and latency not enough on their own?",
    "How would you instrument a RAG pipeline end to end?",
    "Sampling traces versus logging everything — what drives the choice?",
    "How would you alert on a silent quality regression?",
    "Design an observability stack covering cost, latency and answer quality.",
  ],
  deployment: [
    "How would you deploy an AI service?",
    "Why do cold starts and provider quotas change your deployment plan?",
    "How would you handle concurrency for long-running model calls?",
    "Self-hosted inference versus hosted APIs — what's the real trade-off?",
    "What's your rollback plan when a new prompt or model degrades quality?",
    "Design a deployment topology for a global, latency-sensitive AI product.",
  ],
  capstone: [
    "Give me the two-minute version of what you built.",
    "Why did you make the core architecture decision the way you did?",
    "How does data flow through your system from request to response?",
    "What did you deliberately leave out, and why?",
    "What would break first if a thousand users arrived tomorrow?",
    "How would you re-architect it now that you've built it once?",
  ],
  communication: [
    "How would you explain your system to a non-AI engineer?",
    "Why is that framing the clearest one for that audience?",
    "Walk me through how you'd demo the hardest part of it.",
    "How do you present a trade-off you're not fully happy with?",
    "How would you defend an architecture decision under pushback?",
    "How would you write the design doc for this system?",
  ],
};

export function ladderFor(day: CurriculumDay): string[] {
  const bank = BANK[day.topic];
  if (bank) return bank;
  const label = topicLabel(day.topic);
  const obj = day.objectives[0] ?? label;
  const obj2 = day.objectives[1] ?? obj;
  return [
    `From day ${day.day}, ${day.title} — what is it, in your own words?`,
    `Why does ${label.toLowerCase()} matter for the systems you build?`,
    `How would you implement this: ${obj.toLowerCase()}?`,
    `What trade-off do you accept when you ${obj2.toLowerCase()}?`,
    `What changes about ${label.toLowerCase()} once the system is in production?`,
    `Design a production-grade approach to ${label.toLowerCase()} for a large team.`,
  ];
}

export const LEVEL_NAMES = [
  "Concept",
  "Understanding",
  "Implementation",
  "Trade-off",
  "Production",
  "Architecture",
];