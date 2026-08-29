import { answerQuiz, completeFixedStage, createInitialDemoState, finalizeMission, recordArAttempt, setAppearance } from '@/src/application/demo-engine';
import { migrateDemoState } from '@/src/application/migrations';
import { DEMO_SCHEMA_VERSION, type DemoState, type DemoStep, type PilgrimAppearance } from '@/src/domain/types';
import { createStore } from 'zustand/vanilla';
import { persist, type PersistStorage } from 'zustand/middleware';

export const DEMO_STORAGE_KEY = 'peregrino-demo-v1';

export interface DemoActions {
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
export interface CreateDemoStoreOptions { storage?: PersistStorage<DemoState>; now?: () => string }

export function createDemoStore(options: CreateDemoStoreOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  return createStore<DemoStore>()(
    persist<DemoStore, [], [], DemoState>(
      (set) => ({
        ...createInitialDemoState(now()),
        setAppearance: (appearance) => set((state) => ({ ...state, ...setAppearance(state, appearance, now()) })),
        goTo: (currentStep) => set((state) => ({ ...state, currentStep, updatedAt: now() })),
        completeDiscovery: () => set((state) => ({ ...state, ...completeFixedStage(state, 'discovery', now()) })),
        completePreparation: () => set((state) => ({ ...state, ...completeFixedStage(state, 'preparation', now()) })),
        recordArResult: (hit) => set((state) => ({ ...state, ...recordArAttempt(state, hit, now()) })),
        answerQuiz: (questionId, correct) => set((state) => ({ ...state, ...answerQuiz(state, questionId, correct, now()) })),
        finalizeMission: () => set((state) => ({ ...state, ...finalizeMission(state, now()) })),
        resetDemo: () => set((state) => ({ ...state, ...createInitialDemoState(now()) })),
      }),
      {
        name: DEMO_STORAGE_KEY,
        version: DEMO_SCHEMA_VERSION,
        storage: options.storage,
        partialize: toDemoState,
        migrate: (persisted, version) => migrateDemoState(persisted, version, now()),
        merge: (persisted, current) => ({ ...current, ...migrateDemoState(persisted, DEMO_SCHEMA_VERSION, now()) }),
      },
    ),
  );
}

function toDemoState(store: DemoStore): DemoState {
  return {
    schemaVersion: store.schemaVersion,
    appearance: store.appearance,
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
