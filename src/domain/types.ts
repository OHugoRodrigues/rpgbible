import type { MinigameProgress } from '@/src/games/types';

export const DEMO_SCHEMA_VERSION = 4 as const;

export type JourneyId =
  | 'davi'
  | 'moises'
  | 'josue'
  | 'abraao'
  | 'jaco'
  | 'jesus';
export type ChapterId = 'escolhido' | 'pastor' | 'provacao' | 'rei' | 'legado';
export type MissionStage = 'discovery' | 'preparation' | 'ar' | 'quiz';
export type RewardTier = 'common' | 'rare' | 'epic';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type AgeBand = '6-9' | '10-13' | '14-17' | '18+';
export type FaithAnswer = 'yes' | 'no' | 'exploring' | 'prefer-not-to-say';
export type ReadingAffinity = 'yes' | 'sometimes' | 'no';
export type NarrativePreference = 'romance' | 'heroes' | 'adventure';
export type ExperienceMode = 'textual' | 'gamified' | 'balanced';
export type AudienceTone = 'child' | 'preteen' | 'teen' | 'general';
export type BiblicalLiteracy = 'introductory' | 'developing' | 'familiar';
export type AdaptiveJourneyStageId =
  | 'chosen'
  | 'shepherd'
  | 'trial'
  | 'king'
  | 'legacy';

export type DemoStep =
  | 'home'
  | 'pilgrim'
  | 'journeys'
  | 'chapters'
  | 'discovery'
  | 'preparation'
  | 'minigame'
  | 'ar'
  | 'quiz'
  | 'david-mission'
  | 'result'
  | 'profile';

export const DAVID_MISSION_PHASES = [
  'supplies-merge',
  'brook-skyfall',
  'david-goliath',
  'parakletos-challenge',
] as const;

export type DavidMissionPhaseId = (typeof DAVID_MISSION_PHASES)[number];
export type DavidPhaseId = DavidMissionPhaseId;

export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

export interface DavidPhaseResult {
  phase: DavidMissionPhaseId;
  completed: boolean;
  points: number;
  completedAt: string | null;
}

export interface DavidMissionState {
  currentPhase: DavidMissionPhaseId;
  completedPhases: DavidMissionPhaseId[];
  phaseResults: Partial<Record<DavidMissionPhaseId, DavidPhaseResult>>;
  phaseData: Partial<Record<DavidMissionPhaseId, SerializableValue>>;
  completed: boolean;
  completedAt: string | null;
}

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

/** Raw onboarding answers are input-only and must not be persisted or sent to an LLM. */
export interface OnboardingAnswers {
  ageBand: AgeBand;
  christianHome: Exclude<FaithAnswer, 'exploring'>;
  christianIdentity: FaithAnswer;
  readingAffinity: ReadingAffinity;
  narrativePreference: NarrativePreference;
}

export interface PersonalizationProfile {
  audienceTone: AudienceTone;
  biblicalLiteracy: BiblicalLiteracy;
  experienceMode: ExperienceMode;
  narrativePreference: NarrativePreference;
}

export interface AdaptiveStageVariant {
  mode: ExperienceMode;
  title: string;
  mechanic: string;
  learningGoal: string;
}

export interface AdaptiveJourneyStage {
  id: AdaptiveJourneyStageId;
  order: number;
  name: string;
  summary: string;
  biblicalReferences: readonly string[];
  variants: Record<ExperienceMode, AdaptiveStageVariant>;
}

export interface StoryRecommendation {
  id: string;
  title: string;
  context: NarrativePreference;
  summary: string;
  biblicalReferences: readonly string[];
}

export interface JourneyPersonalization {
  profile: PersonalizationProfile;
  recommendedStoryIds: string[];
  generatedAt: string;
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

export type CollectibleId =
  | 'stone-of-david'
  | 'sling-of-david'
  | 'harp-of-david'
  | 'crown-of-david'
  | 'scroll-of-samuel';

export type AchievementId = 'courage-to-trust';

export type EquipmentSlot =
  | 'head'
  | 'chest'
  | 'hand'
  | 'waist'
  | 'feet'
  | 'weapon';

export type EquipmentId =
  | 'helmet-of-salvation'
  | 'breastplate-of-righteousness'
  | 'shield-of-faith'
  | 'belt-of-truth'
  | 'shoes-of-readiness'
  | 'sword-of-the-spirit';

export interface Reward {
  id: CollectibleId | EquipmentId | AchievementId;
  kind: 'collectible' | 'equipment' | 'achievement';
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
  personalization: JourneyPersonalization | null;
  minigameProgress: MinigameProgress;
  davidMission?: DavidMissionState | null;
  currentStep: DemoStep;
  stageResults: Partial<Record<MissionStage, StageResult>>;
  quizAnswers: Record<string, QuizAnswerState>;
  score: MissionScore;
  rewards: Reward[];
  consistency: WeeklyConsistency;
  missionCompleted: boolean;
  updatedAt: string;
}
