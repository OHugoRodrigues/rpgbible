import {
  completeDavidMissionPhase,
  createInitialDavidMissionState,
} from '@/src/application/david-mission-progress';
import { createInitialDemoState } from '@/src/application/demo-engine';
import { migrateDemoState } from '@/src/application/migrations';
import { createDemoStore } from '@/src/application/store';
import { DAVID_MISSION_PHASES, type DemoState } from '@/src/domain/types';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { describe, expect, it } from 'vitest';

const now = '2026-08-29T12:00:00.000Z';

function memoryStorage(): StateStorage {
  const values = new Map<string, string>();
  return {
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => void values.set(name, value),
    removeItem: (name) => void values.delete(name),
  };
}

describe('David mission progress', () => {
  it('advances deterministically through exactly four phases', () => {
    let mission = createInitialDavidMissionState();
    expect(() =>
      completeDavidMissionPhase(mission, 'brook-skyfall', now),
    ).toThrow(/Expected David phase/);

    for (const [index, phase] of DAVID_MISSION_PHASES.entries()) {
      mission = completeDavidMissionPhase(mission, phase, now);
      expect(mission.completedPhases).toHaveLength(index + 1);
    }

    expect(mission.completed).toBe(true);
    expect(mission.currentPhase).toBe('parakletos-challenge');
  });

  it.each([0, 1, 2, 3])(
    'resets the entire app when persisted version %i is older than v4',
    (version) => {
      const legacy = {
        ...createInitialDemoState(now),
        schemaVersion: version,
        appearance: {
          presentation: 'feminine',
          hair: 'long',
          outfit: 'blue',
        },
        personalization: {
          profile: {
            audienceTone: 'teen',
            biblicalLiteracy: 'familiar',
            experienceMode: 'gamified',
            narrativePreference: 'heroes',
          },
          recommendedStoryIds: ['legacy-story'],
          generatedAt: now,
        },
        currentStep: 'result',
        missionCompleted: true,
      };
      const migrated = migrateDemoState(legacy, version, now);
      expect(migrated).toEqual(createInitialDemoState(now));
    },
  );

  it('preserves coherent v4 phase lists and resumable data', () => {
    const initial = createInitialDemoState(now);
    const completedPhases = DAVID_MISSION_PHASES.slice(0, 1);
    const migrated = migrateDemoState(
      {
        ...initial,
        davidMission: {
          ...createInitialDavidMissionState(),
          currentPhase: 'brook-skyfall',
          completedPhases,
          phaseResults: {
            'supplies-merge': {
              phase: 'supplies-merge',
              completed: true,
              points: 23,
              completedAt: now,
            },
          },
          phaseData: {
            'brook-skyfall': { score: 120 },
          },
        },
      },
      4,
      now,
    );
    expect(migrated.davidMission?.completedPhases).toEqual(completedPhases);
    expect(migrated.davidMission?.currentPhase).toBe('brook-skyfall');
    expect(migrated.davidMission?.phaseData['brook-skyfall']).toEqual({
      score: 120,
    });
  });
});

describe('David mission store', () => {
  it('persists phase data and finalizes on the fourth phase', () => {
    const store = createDemoStore({ now: () => now });
    store.getState().startDavidMission();
    store.getState().updateDavidPhaseData('supplies-merge', { moves: 12 });
    expect(store.getState().davidMission?.phaseData['supplies-merge']).toEqual({
      moves: 12,
    });

    for (const phase of DAVID_MISSION_PHASES.slice(0, 3))
      store.getState().completeDavidPhase(phase);
    expect(store.getState().missionCompleted).toBe(false);
    expect(store.getState().currentStep).toBe('david-mission');

    store.getState().completeDavidPhase('parakletos-challenge');

    const state = store.getState();
    expect(state.missionCompleted).toBe(true);
    expect(state.currentStep).toBe('result');
    expect(state.score.total).toBe(100);
    expect(state.rewards).toContainEqual(
      expect.objectContaining({
        id: 'courage-to-trust',
        name: 'CORAGEM PARA CONFIAR',
      }),
    );
  });

  it('aggregates custom phase performance into the final score', () => {
    const store = createDemoStore({ now: () => now });
    store.getState().startDavidMission();
    for (const phase of DAVID_MISSION_PHASES)
      store.getState().completeDavidPhase(phase, 5);

    expect(store.getState().score.total).toBe(20);
    expect(store.getState().score.tier).toBe('common');
  });

  it('replays a completed trail from phase one with clean variables', () => {
    const store = createDemoStore({ now: () => now });
    store.getState().startDavidMission();
    store
      .getState()
      .updateDavidPhaseData('supplies-merge', { moves: 12, lives: 1 });
    for (const phase of DAVID_MISSION_PHASES)
      store.getState().completeDavidPhase(phase);

    expect(store.getState().missionCompleted).toBe(true);
    store.getState().startDavidMission();

    expect(store.getState()).toMatchObject({
      currentStep: 'david-mission',
      missionCompleted: false,
      score: { total: 0 },
      davidMission: createInitialDavidMissionState(),
    });
  });

  it('rehydrates progress saved in the merge and brook phases', () => {
    const storage = createJSONStorage<DemoState>(memoryStorage);
    const first = createDemoStore({ now: () => now, storage });
    first.getState().startDavidMission();

    const mergeProgress = {
      moves: 7,
      bakedBread: 2,
      thickCheese: 1,
      board: Array.from({ length: 25 }, (_, index) =>
        index < 2 ? 'baked-bread' : index === 2 ? 'thick-cheese' : null,
      ),
    };
    first.getState().updateDavidPhaseData('supplies-merge', mergeProgress);

    const resumedMerge = createDemoStore({ now: () => now, storage });
    expect(
      resumedMerge.getState().davidMission?.phaseData['supplies-merge'],
    ).toEqual(mergeProgress);

    resumedMerge.getState().completeDavidPhase('supplies-merge');
    const brookProgress = {
      stones: 3,
      score: 260,
      lives: 2,
      playerX: 184,
      speedMultiplier: 1.15,
    };
    resumedMerge
      .getState()
      .updateDavidPhaseData('brook-skyfall', brookProgress);

    const resumedBrook = createDemoStore({ now: () => now, storage });
    expect(
      resumedBrook.getState().davidMission?.phaseData['brook-skyfall'],
    ).toEqual(brookProgress);
    expect(resumedBrook.getState().davidMission?.currentPhase).toBe(
      'brook-skyfall',
    );
  });
});
