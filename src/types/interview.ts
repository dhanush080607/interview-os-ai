export type MissionStatus = "completed" | "attempted" | "skipped";

export interface Mission {
  day: number;
  title: string;
  topic: string;
  status: MissionStatus;
  notes: string;
}

export interface LearningSignal {
  label: string;
  type: "strength" | "risk";
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  track: string;
  avatarInitials: string;
  missions: Mission[];
  learningSignals: LearningSignal[];
}

export interface CurriculumDay {
  day: number;
  module: string;
  title: string;
  topic: string;
  objectives: string[];
  tools: string[];
}

export interface CurriculumModule {
  id: string;
  name: string;
  days: number[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export type AnswerQuality = "strong" | "good" | "partial" | "weak" | "incorrect" | "unclear";

export type QuestionKind = "primary" | "followup" | "context-probe";

export interface InterviewQuestion {
  id: string;
  text: string;
  day: number;
  dayTitle: string;
  topic: string;
  level: number;
  kind: QuestionKind;
}

export interface InterviewAnswer {
  questionId: string;
  text: string;
  quality: AnswerQuality;
  score: number;
  keywords: string[];
  day: number;
  topic: string;
}

export interface FeedbackDimension {
  name: string;
  score: number;
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewAssessment {
  overallScore: number;
  headline: string;
  dimensions: FeedbackDimension[];
  learningPlan: string[];
}

export interface InterviewStrategy {
  primaryAreas: string[];
  secondaryAreas: string[];
  potentialGaps: string[];
  plan: number[];
}

export interface InterviewMemory {
  covered: { day: number; title: string; topic: string; quality: AnswerQuality }[];
  strongSignals: number;
  needsProbing: number;
  notAssessed: string[];
}

export interface InterviewProgress {
  questionNumber: number;
  questionsAsked: number;
  minQuestions: number;
  daysCovered: number[];
  minDays: number;
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  strategy: InterviewStrategy;
  questionsAsked: InterviewQuestion[];
  answers: InterviewAnswer[];
  curriculumDaysCovered: number[];
  topicsCovered: string[];
  currentTopic: string;
  currentDifficulty: number;
  answerQuality: AnswerQuality | null;
  followUpsAsked: number;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  questionCount: number;
  planIndex: number;
  done: boolean;
  feedback: InterviewFeedback | null;
  assessment: InterviewAssessment | null;
  createdAt: number;
}

export interface InterviewApiResponse {
  sessionId: string;
  reply: string;
  done: boolean;
  question?: InterviewQuestion;
  progress?: InterviewProgress;
  memory?: InterviewMemory;
  candidate?: { id: string; name: string; title: string; avatarInitials: string };
  feedback?: InterviewFeedback;
  assessment?: InterviewAssessment;
  engine?: "ai" | "deterministic";
}