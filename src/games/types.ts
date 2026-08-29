import type {
  AdaptiveJourneyStageId,
  ExperienceMode,
} from '@/src/domain/types';

export type MinigameKind =
  | 'word-grid'
  | 'anagram-race'
  | 'context-choice'
  | 'evidence-chain'
  | 'timeline';
export type Material =
  | 'straw'
  | 'grass'
  | 'wood'
  | 'silver'
  | 'gold'
  | 'gemstone';
export type MinigameStatus =
  | 'active'
  | 'recovery-required'
  | 'recovery-task'
  | 'cooldown'
  | 'completed';
export type RecoveryMode = 'context-task' | 'guided-reading';

export interface MinigameVariant {
  mode: ExperienceMode;
  kind: MinigameKind;
  title: string;
  instructions: string;
  prompt: string;
  timeLimitSeconds: number;
  acceptedAnswers: readonly string[];
  choices?: readonly string[];
  letterBank?: string;
}

export interface RecoveryReading {
  biblicalReference: string;
  readingPrompt: string;
  checkQuestion: string;
  acceptedAnswers: readonly string[];
}

export interface MinigameDefinition {
  id: AdaptiveJourneyStageId;
  historicalContext: string;
  biblicalReferences: readonly string[];
  provocativeQuestion: string;
  variants: Record<ExperienceMode, MinigameVariant>;
  recoveryReading: RecoveryReading;
  reviewStatus: 'po-review-required' | 'approved';
}

export interface MaterialReward {
  material: Material;
  quantity: number;
  score: number;
  reason: 'completion' | 'first-exhaustion' | 'recovery-task';
}

export type MaterialInventory = Record<Material, number>;

export interface MinigameSession {
  challengeId: AdaptiveJourneyStageId;
  mode: ExperienceMode;
  status: MinigameStatus;
  startedAt: string;
  attemptStartedAt: string;
  deadlineAt: string;
  completedAt: string | null;
  maxLives: 3;
  livesRemaining: number;
  wrongAttempts: number;
  recoveryCount: number;
  lastRecoveryMode: RecoveryMode | null;
  cooldownAvailableAt: string | null;
  exhaustionRewardGranted: boolean;
  recoveryRewardGranted: boolean;
  reward: MaterialReward | null;
}

export interface MinigameProgress {
  sessions: Partial<Record<AdaptiveJourneyStageId, MinigameSession>>;
  materials: MaterialInventory;
}

export interface MinigameTransition {
  session: MinigameSession;
  correct: boolean;
  rewards: MaterialReward[];
}

export interface RecoveryNotification {
  id: string;
  availableAt: string;
  title: string;
  body: string;
}

export interface RecoveryNotificationAdapter {
  schedule(notification: RecoveryNotification): void;
  cancel(id: string): void;
  dispose(): void;
}
