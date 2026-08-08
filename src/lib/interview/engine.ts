import type {
  AnswerQuality,
  Candidate,
  InterviewAnswer,
  InterviewAssessment,
  InterviewFeedback,
  InterviewMemory,
  InterviewQuestion,
  InterviewSession,
  InterviewStrategy,
} from "@/types/interview";
import { DIMENSIONS, TOPIC_DIMENSION, curriculum, getDay, topicLabel } from "./data";
import { ladderFor } from "./questions";

export const MIN_QUESTIONS = 8;
export const MIN_DAYS = 4;

/* ------------------------------------------------------------------ */
/* Candidate journey analysis                                          */
/* ------------------------------------------------------------------ */

export function analyzeCandidate(candidate: Candidate): InterviewStrategy {
  const completed = candidate.missions.filter((m) => m.status === "completed");
  const attempted = candidate.missions.filter((m) => m.status === "attempted");
  const skipped = candidate.missions.filter((m) => m.status === "skipped");

  const uniqueTopics = (days: { topic: string }[]) =>
    Array.from(new Set(days.map((d) => topicLabel(d.topic))));

  const primaryAreas = uniqueTopics(completed).slice(0, 4);
  const secondaryAreas = uniqueTopics(attempted).slice(0, 4);
  const potentialGaps = uniqueTopics(skipped).slice(0, 4);

  // Interview plan: strongest ground first, then shaky ground, then a gap.
  const byModule = new Map<string, number[]>();
  for (const m of candidate.missions) {
    const day = getDay(m.day);
    if (!day) continue;
    const list = byModule.get(day.module) ?? [];
    list.push(m.day);
    byModule.set(day.module, list);
  }

  const pick = (status: string, count: number) => {
    const seenModules = new Set<string>();
    const out: number[] = [];
    for (const m of candidate.missions) {
      if (m.status !== status) continue;
      const day = getDay(m.day);
      if (!day) continue;
      if (seenModules.has(day.module)) continue;
      seenModules.add(day.module);
      out.push(m.day);
      if (out.length >= count) break;
    }
    return out;
  };

  const plan = [
    ...pick("completed", 3),
    ...pick("attempted", 2),
    ...pick("skipped", 1),
  ];

  // Guarantee enough distinct curriculum days even for sparse candidates.
  if (plan.length < 6) {
    for (const m of candidate.missions) {
      if (!plan.includes(m.day)) plan.push(m.day);
      if (plan.length >= 6) break;
    }
  }
  if (plan.length < 6) {
    for (const d of curriculum.days) {
      if (!plan.includes(d.day)) plan.push(d.day);
      if (plan.length >= 6) break;
    }
  }

  return { primaryAreas, secondaryAreas, potentialGaps, plan };
}

/* ------------------------------------------------------------------ */
/* Answer analysis                                                     */
/* ------------------------------------------------------------------ */

const TECH_VOCAB = [
  "embedding","embeddings","vector","vectors","chunk","chunking","index","hnsw","ivf","cosine",
  "bm25","rerank","reranking","retrieval","rag","context","prompt","few-shot","token","tokens",
  "latency","throughput","cache","caching","redis","postgres","pgvector","chroma","pinecone",
  "faiss","agent","agents","tool","tools","mcp","schema","zod","json","stream","streaming","sse",
  "eval","evaluation","ragas","faithfulness","recall","precision","hallucination","guardrail",
  "injection","observability","tracing","langsmith","docker","scale","scaling","concurrency",
  "cost","fallback","retry","timeout","memory","summarisation","summarization","metadata","filter",
  "hybrid","semantic","pipeline","batch","monitoring","benchmark","quantisation","quantization",
];

const REASONING_MARKERS = [
  "because","so that","trade-off","tradeoff","instead","however","which means","therefore",
  "the reason","compared","versus","vs","downside","benefit","risk","otherwise","in production",
];

const UNCERTAIN_MARKERS = [
  "not sure","no idea","don't know","dont know","i think maybe","never used","skip","pass","?",
];

export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const hits = TECH_VOCAB.filter((t) => lower.includes(t));
  if (hits.length) return Array.from(new Set(hits)).slice(0, 5);
  const words = lower
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 6);
  return words.slice(0, 2);
}

export function gradeAnswer(text: string): { quality: AnswerQuality; score: number; keywords: string[] } {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean).length;
  const keywords = extractKeywords(clean);
  const techHits = keywords.length;
  const reasoningHits = REASONING_MARKERS.filter((m) => lower.includes(m)).length;
  const uncertain = UNCERTAIN_MARKERS.some((m) => lower.includes(m));

  if (!clean) return { quality: "unclear", score: 0, keywords: [] };
  if (words < 6 && techHits === 0) {
    return { quality: uncertain ? "incorrect" : "unclear", score: uncertain ? 8 : 15, keywords };
  }

  let score = 0;
  score += Math.min(35, words * 0.9); // depth of explanation
  score += Math.min(30, techHits * 8); // correct technical vocabulary
  score += Math.min(25, reasoningHits * 9); // reasoning / trade-off language
  if (uncertain) score -= 22;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let quality: AnswerQuality;
  if (uncertain && score < 45) quality = "weak";
  else if (score >= 78) quality = "strong";
  else if (score >= 60) quality = "good";
  else if (score >= 42) quality = "partial";
  else if (score >= 25) quality = "weak";
  else quality = "incorrect";

  return { quality, score, keywords };
}

/* ------------------------------------------------------------------ */
/* Question generation                                                 */
/* ------------------------------------------------------------------ */

function makeQuestion(
  session: InterviewSession,
  day: number,
  level: number,
  text: string,
  kind: InterviewQuestion["kind"],
): InterviewQuestion {
  const d = getDay(day);
  return {
    id: `${session.sessionId}-q${session.questionCount + 1}`,
    text,
    day,
    dayTitle: d?.title ?? `Day ${day}`,
    topic: d?.topic ?? "general",
    level,
    kind,
  };
}

function averageScore(answers: InterviewAnswer[]): number {
  if (!answers.length) return 50;
  return answers.reduce((a, b) => a + b.score, 0) / answers.length;
}

function lastAnswer(session: InterviewSession): InterviewAnswer | undefined {
  return session.answers[session.answers.length - 1];
}

/** A context probe references something the candidate said several turns ago. */
function contextProbe(session: InterviewSession): InterviewQuestion | null {
  if (session.questionCount < 5) return null;
  const earlier = session.answers.slice(0, -1).filter((a) => a.keywords.length && a.score >= 40);
  if (!earlier.length) return null;
  const pickIdx = session.questionCount % earlier.length;
  const a = earlier[pickIdx];
  if (!a) return null;
  const day = getDay(a.day);
  return makeQuestion(
    session,
    a.day,
    Math.min(6, 4),
    `Earlier, on ${day?.title ?? `day ${a.day}`}, you leaned on "${a.keywords[0]}" as your reasoning. Would that reasoning still hold at enterprise scale — and what would you change?`,
    "context-probe",
  );
}

function followUp(session: InterviewSession, ans: InterviewAnswer): InterviewQuestion | null {
  const day = getDay(ans.day);
  if (!day) return null;
  const ladder = ladderFor(day);
  const kw = ans.keywords[0] ?? day.title.toLowerCase();
  const label = topicLabel(day.topic).toLowerCase();

  if (ans.quality === "strong" || ans.quality === "good") {
    if (session.followUpsAsked >= 2) return null;
    const nextLevel = Math.min(6, session.currentDifficulty + 1);
    const deeper = ladder[nextLevel - 1] ?? ladder[ladder.length - 1]!;
    return makeQuestion(
      session,
      ans.day,
      nextLevel,
      `You mentioned ${kw}. ${deeper}`,
      "followup",
    );
  }

  if (ans.quality === "partial") {
    if (session.followUpsAsked >= 2) return null;
    return makeQuestion(
      session,
      ans.day,
      session.currentDifficulty,
      `You touched on ${kw}, but I want the mechanics. Concretely, how would you implement that part of ${label}, and how would you know it worked?`,
      "followup",
    );
  }

  // weak / incorrect / unclear -> simplify once, then move on.
  if (session.followUpsAsked >= 1) return null;
  return makeQuestion(
    session,
    ans.day,
    1,
    `Let's simplify. In your own words, what problem does ${label} solve, and where have you seen it used?`,
    "followup",
  );
}

function nextPrimary(session: InterviewSession): InterviewQuestion | null {
  const plan = session.strategy.plan;
  let idx = session.planIndex;
  while (idx < plan.length && session.curriculumDaysCovered.includes(plan[idx]!)) idx++;
  if (idx >= plan.length) {
    const extra = curriculum.days.find((d) => !session.curriculumDaysCovered.includes(d.day));
    if (!extra) return null;
    plan.push(extra.day);
    idx = plan.length - 1;
  }
  const day = plan[idx]!;
  session.planIndex = idx;
  const d = getDay(day);
  if (!d) return null;
  const avg = averageScore(session.answers);
  const level = session.answers.length === 0 ? 1 : avg >= 72 ? 3 : avg >= 55 ? 2 : 1;
  const ladder = ladderFor(d);
  const text = ladder[level - 1] ?? ladder[0]!;
  const lead =
    session.questionCount === 0
      ? ""
      : `Let's move to ${d.title} — day ${d.day} of your cohort. `;
  return makeQuestion(session, day, level, `${lead}${text}`, "primary");
}

export function shouldComplete(session: InterviewSession): boolean {
  return (
    session.questionCount >= MIN_QUESTIONS &&
    session.curriculumDaysCovered.length >= MIN_DAYS &&
    session.answers.length >= MIN_QUESTIONS
  );
}

export function nextQuestion(session: InterviewSession): InterviewQuestion | null {
  const ans = lastAnswer(session);

  if (!ans) return nextPrimary(session);

  if (ans.day === session.questionsAsked[session.questionsAsked.length - 1]?.day) {
    const fu = followUp(session, ans);
    if (fu) return fu;
  }

  const probe = contextProbe(session);
  if (probe && session.questionCount >= 5 && session.questionCount % 4 === 1) return probe;

  session.planIndex += 1;
  session.followUpsAsked = 0;
  return nextPrimary(session);
}

/* ------------------------------------------------------------------ */
/* Interviewer phrasing                                                */
/* ------------------------------------------------------------------ */

export function acknowledgement(quality: AnswerQuality): string {
  switch (quality) {
    case "strong":
      return "That's a solid answer — you clearly built this.";
    case "good":
      return "Good, that mostly holds up.";
    case "partial":
      return "Okay, that's the outline — I want a bit more depth.";
    case "weak":
      return "Alright, let's steady that up.";
    case "incorrect":
      return "That's not quite how it works — let's take a step back.";
    default:
      return "I'm not sure I followed that.";
  }
}

/* ------------------------------------------------------------------ */
/* Memory + feedback                                                   */
/* ------------------------------------------------------------------ */

export function buildMemory(session: InterviewSession): InterviewMemory {
  const byDay = new Map<number, InterviewAnswer[]>();
  for (const a of session.answers) {
    byDay.set(a.day, [...(byDay.get(a.day) ?? []), a]);
  }
  const covered = Array.from(byDay.entries()).map(([day, list]) => {
    const avg = list.reduce((s, a) => s + a.score, 0) / list.length;
    const d = getDay(day);
    const quality: AnswerQuality =
      avg >= 78 ? "strong" : avg >= 60 ? "good" : avg >= 42 ? "partial" : "weak";
    return { day, title: d?.title ?? `Day ${day}`, topic: d?.topic ?? "general", quality };
  });
  const notAssessed = session.strategy.plan
    .filter((d) => !session.curriculumDaysCovered.includes(d))
    .map((d) => getDay(d)?.title ?? `Day ${d}`)
    .slice(0, 3);

  return {
    covered,
    strongSignals: covered.filter((c) => c.quality === "strong" || c.quality === "good").length,
    needsProbing: covered.filter((c) => c.quality === "partial" || c.quality === "weak").length,
    notAssessed,
  };
}

export function buildFeedback(session: InterviewSession): {
  feedback: InterviewFeedback;
  assessment: InterviewAssessment;
} {
  const memory = buildMemory(session);
  const avg = Math.round(averageScore(session.answers));

  const dimScores = new Map<string, number[]>();
  for (const a of session.answers) {
    const dim = TOPIC_DIMENSION[a.topic] ?? "Communication";
    dimScores.set(dim, [...(dimScores.get(dim) ?? []), a.score]);
  }
  // Communication is derived from how thoroughly answers were explained.
  const commScore = Math.round(
    session.answers.reduce(
      (s, a) => s + Math.min(100, a.text.trim().split(/\s+/).length * 2.2 + a.keywords.length * 5),
      0,
    ) / Math.max(1, session.answers.length),
  );

  const dimensions = DIMENSIONS.map((name) => {
    if (name === "Communication") return { name, score: commScore };
    const list = dimScores.get(name);
    if (!list || !list.length) return { name, score: 0 };
    return { name, score: Math.round(list.reduce((a, b) => a + b, 0) / list.length) };
  }).filter((d) => d.score > 0 || d.name === "Communication");

  const strongDays = memory.covered.filter((c) => c.quality === "strong" || c.quality === "good");
  const weakDays = memory.covered.filter((c) => c.quality === "partial" || c.quality === "weak");

  const strengths = strongDays.map(
    (c) => `${topicLabel(c.topic)} (day ${c.day}, ${c.title}) — explained with concrete implementation detail.`,
  );
  if (!strengths.length) {
    strengths.push("Engaged with every question and stayed with the technical thread throughout.");
  }

  const gaps = weakDays.map(
    (c) => `${topicLabel(c.topic)} (day ${c.day}, ${c.title}) — answers stayed conceptual, missing implementation and trade-off depth.`,
  );
  for (const g of session.strategy.potentialGaps) {
    if (gaps.length < 4) gaps.push(`${g} — never covered in the cohort and not demonstrable in interview.`);
  }
  if (!gaps.length) gaps.push("Production-scale reasoning could be sharper: quantify limits and failure modes.");

  const next: string[] = [];
  for (const c of weakDays.slice(0, 3)) {
    next.push(`Rebuild the day ${c.day} exercise (${c.title}) and write up the trade-offs you chose.`);
  }
  for (const g of session.strategy.potentialGaps.slice(0, 2)) {
    next.push(`Complete the ${g} module and ship a small demo you can talk through.`);
  }
  next.push("Practise explaining one architecture decision in under two minutes.");
  next.push("Retake this interview and compare the coverage map.");

  const headline =
    avg >= 80
      ? "Strong Technical Foundation"
      : avg >= 65
        ? "Solid, With Clear Growth Areas"
        : avg >= 45
          ? "Developing Technical Depth"
          : "Early-Stage Technical Depth";

  const summary =
    `${session.candidate.name} covered ${session.curriculumDaysCovered.length} curriculum days across ` +
    `${session.questionCount} questions. ` +
    (strongDays.length
      ? `Strongest ground was ${strongDays.map((d) => topicLabel(d.topic)).slice(0, 3).join(", ")}, where answers included implementation detail and reasoning. `
      : "Answers stayed largely conceptual across the areas assessed. ") +
    (weakDays.length
      ? `Depth dropped on ${weakDays.map((d) => topicLabel(d.topic)).slice(0, 3).join(", ")}, where trade-offs and production behaviour were not fully articulated.`
      : "Depth held up under follow-up probing across every area assessed.");

  const learningPlan = [
    ...(weakDays[0] ? [`Review ${weakDays[0].title} fundamentals (day ${weakDays[0].day})`] : []),
    ...(weakDays[1] ? [`Rebuild the ${weakDays[1].title} exercise end to end`] : []),
    ...(session.strategy.potentialGaps[0] ? [`Study ${session.strategy.potentialGaps[0]} from first principles`] : []),
    ...(session.strategy.potentialGaps[1] ? [`Ship a small ${session.strategy.potentialGaps[1]} demo`] : []),
    "Write an evaluation harness for one system you built",
    "Draft a production monitoring plan for that system",
    "Retake this interview and compare your coverage",
  ].slice(0, 7);
  while (learningPlan.length < 7) learningPlan.push("Do a timed mock interview with a peer");

  return {
    feedback: { summary, strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4), next: next.slice(0, 4) },
    assessment: { overallScore: avg, headline, dimensions, learningPlan },
  };
}