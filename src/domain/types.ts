export const DEMO_SCHEMA_VERSION = 1 as const;

export type JourneyId = 'davi' | 'moises' | 'josue' | 'abraao' | 'jaco' | 'jesus';
export type ChapterId = 'escolhido' | 'pastor' | 'provacao' | 'rei' | 'legado';
export type MissionStage = 'discovery' | 'preparation' | 'ar' | 'quiz';
export type RewardTier = 'common' | 'rare' | 'epic';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type DemoStep =
  | 'home'
  | 'pilgrim'
  | 'journeys'
  | 'chapters'
  | 'discovery'
  | 'preparation'
  | 'ar'
  | 'quiz'
  | 'result'
  | 'profile';

export interface Journey {
  id: JourneyId;
  name: string;
  theme: string;
  available: boolean;
}

export interface Chapter {
  id: ChapterId;
  order: number;
  name: string;
  summary: string;
  playable: boolean;
}

export interface PilgrimAppearance {
  presentation: 'masculine' | 'feminine';
  hair: 'short' | 'long';
  outfit: 'sand' | 'blue';
}

export interface StageResult {
  stage: MissionStage;
  completed: boolean;
  points: number;
  completedAt: string | null;
}

export interface QuizAnswerState {
  attempts: number;
  completed: boolean;
  firstAttemptCorrect: boolean;
}

export interface MissionScore {
  discovery: number;
  preparation: number;
  ar: number;
  quiz: number;
  total: number;
  tier: RewardTier;
}

export interface Reward {
  id: 'stone-of-david' | 'shield-of-faith';
  kind: 'collectible' | 'equipment';
  name: string;
  tier: RewardTier;
  source: string;
  biblicalReference: string;
}

export interface WeeklyConsistency {
  activeDays: Weekday[];
  goalReached: boolean;
  completeWeek: boolean;
}

export interface DemoState {
  schemaVersion: typeof DEMO_SCHEMA_VERSION;
  appearance: PilgrimAppearance;
  currentStep: DemoStep;
  stageResults: Partial<Record<MissionStage, StageResult>>;
  quizAnswers: Record<string, QuizAnswerState>;
  score: MissionScore;
  rewards: Reward[];
  consistency: WeeklyConsistency;
  missionCompleted: boolean;
  updatedAt: string;
}
