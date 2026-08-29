import {
  answerQuiz,
  completeFixedStage,
  completeOnboarding,
  createInitialDemoState,
  finalizeMission,
  recordArAttempt,
  setAppearance,
} from '@/src/application/demo-engine';
import { migrateDemoState } from '@/src/application/migrations';
import {
  answerJourneyMinigame,
  answerJourneyRecoveryTask,
  chooseJourneyMinigameRecovery,
  resumeJourneyMinigame,
  startJourneyMinigame,
} from '@/src/application/minigame-progress';
import {
  DEMO_SCHEMA_VERSION,
  type AdaptiveJourneyStageId,
  type DemoState,
  type DemoStep,
  type OnboardingAnswers,
  type PilgrimAppearance,
} from '@/src/domain/types';
import type { RecoveryMode } from '@/src/games/types';
import { createStore } from 'zustand/vanilla';
import { persist, type PersistStorage } from 'zustand/middleware';

export const DEMO_STORAGE_KEY = 'peregrino-demo-v1';

export interface DemoActions {
  completeOnboarding(answers: OnboardingAnswers): void;
  startMinigame(challengeId: AdaptiveJourneyStageId): void;
  answerMinigame(challengeId: AdaptiveJourneyStageId, answer: string): void;
  chooseMinigameRecovery(
    challengeId: AdaptiveJourneyStageId,
    mode: RecoveryMode,
  ): void;
  answerRecoveryTask(challengeId: AdaptiveJourneyStageId, answer: string): void;
  resumeMinigame(challengeId: AdaptiveJourneyStageId): void;
  setAppearance(appearance: PilgrimAppearance): void;
  goTo(step: DemoStep): void;
  completeDiscovery(): void;
  completePreparation(): void;
  recordArResult(hit: boolean): void;
  answerQuiz(questionId: string, correct: boolean): void;
  finalizeMission(): void;
  resetDemo(): void;
}

export type DemoStore = DemoState & DemoActions;
export interface CreateDemoStoreOptions {
  storage?: PersistStorage<DemoState>;
  now?: () => string;
}

export function createDemoStore(options: CreateDemoStoreOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  return createStore<DemoStore>()(
    persist<DemoStore, [], [], DemoState>(
      (set) => ({
        ...createInitialDemoState(now()),
        completeOnboarding: (answers) =>
          set((state) => ({
            ...state,
            ...completeOnboarding(state, answers, now()),
          })),
        startMinigame: (challengeId) =>
          set((state) => ({
            ...state,
            ...startJourneyMinigame(state, challengeId, now()),
          })),
        answerMinigame: (challengeId, answer) =>
          set((state) => ({
            ...state,
            ...answerJourneyMinigame(state, challengeId, answer, now()),
          })),
        chooseMinigameRecovery: (challengeId, mode) =>
          set((state) => ({
            ...state,
            ...chooseJourneyMinigameRecovery(state, challengeId, mode, now()),
          })),
        answerRecoveryTask: (challengeId, answer) =>
          set((state) => ({
            ...state,
            ...answerJourneyRecoveryTask(state, challengeId, answer, now()),
          })),
        resumeMinigame: (challengeId) =>
          set((state) => ({
            ...state,
            ...resumeJourneyMinigame(state, challengeId, now()),
          })),
        setAppearance: (appearance) =>
          set((state) => ({
            ...state,
            ...setAppearance(state, appearance, now()),
          })),
        goTo: (currentStep) =>
          set((state) => ({ ...state, currentStep, updatedAt: now() })),
        completeDiscovery: () =>
          set((state) => ({
            ...state,
            ...completeFixedStage(state, 'discovery', now()),
          })),
        completePreparation: () =>
          set((state) => ({
            ...state,
            ...completeFixedStage(state, 'preparation', now()),
          })),
        recordArResult: (hit) =>
          set((state) => ({ ...state, ...recordArAttempt(state, hit, now()) })),
        answerQuiz: (questionId, correct) =>
          set((state) => ({
            ...state,
            ...answerQuiz(state, questionId, correct, now()),
          })),
        finalizeMission: () =>
          set((state) => ({ ...state, ...finalizeMission(state, now()) })),
        resetDemo: () =>
          set((state) => ({ ...state, ...createInitialDemoState(now()) })),
      }),
      {
        name: DEMO_STORAGE_KEY,
        version: DEMO_SCHEMA_VERSION,
        storage: options.storage,
        partialize: toDemoState,
        migrate: (persisted, version) =>
          migrateDemoState(persisted, version, now()),
        merge: (persisted, current) => ({
          ...current,
          ...migrateDemoState(persisted, DEMO_SCHEMA_VERSION, now()),
        }),
      },
    ),
  );
}

function toDemoState(store: DemoStore): DemoState {
  return {
    schemaVersion: store.schemaVersion,
    appearance: store.appearance,
    personalization: store.personalization,
    minigameProgress: store.minigameProgress,
    currentStep: store.currentStep,
    stageResults: store.stageResults,
    quizAnswers: store.quizAnswers,
    score: store.score,
    rewards: store.rewards,
    consistency: store.consistency,
    missionCompleted: store.missionCompleted,
    updatedAt: store.updatedAt,
  };
}
