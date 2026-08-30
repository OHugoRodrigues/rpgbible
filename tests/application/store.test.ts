import { createDemoStore } from '@/src/application/store';
import type { DemoState } from '@/src/domain/types';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { describe, expect, it } from 'vitest';

function memoryStorage(): StateStorage {
  const values = new Map<string, string>();
  return {
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => void values.set(name, value),
    removeItem: (name) => void values.delete(name),
  };
}

describe('demo store', () => {
  it('uses injected persistence and resets to a seeded week', () => {
    const clock = () => '2026-08-29T12:00:00.000Z';
    const store = createDemoStore({
      storage: createJSONStorage<DemoState>(memoryStorage),
      now: clock,
    });
    store.getState().goTo('journeys');
    expect(store.getState().currentStep).toBe('journeys');
    store.getState().resetDemo();
    expect(store.getState().currentStep).toBe('home');
    expect(store.getState().consistency.activeDays).toEqual([
      'mon',
      'tue',
      'wed',
    ]);
  });

  it('stores only the derived onboarding profile', () => {
    const store = createDemoStore({ now: () => '2026-08-29T12:00:00.000Z' });
    store.getState().completeOnboarding({
      ageBand: '14-17',
      christianHome: 'no',
      christianIdentity: 'exploring',
      readingAffinity: 'no',
      narrativePreference: 'heroes',
    });
    expect(store.getState().personalization?.profile).toEqual({
      audienceTone: 'teen',
      biblicalLiteracy: 'developing',
      experienceMode: 'gamified',
      narrativePreference: 'heroes',
    });
    expect(store.getState()).not.toHaveProperty('christianIdentity');
  });

  it('persists minigame sessions and material rewards in demo state', () => {
    let timestamp = '2026-08-29T12:00:00.000Z';
    const store = createDemoStore({ now: () => timestamp });
    store.getState().startMinigame('trial');
    timestamp = '2026-08-29T12:00:05.000Z';
    store.getState().answerMinigame('trial', 'cajado, funda e cinco pedras');
    expect(store.getState().minigameProgress.sessions.trial?.status).toBe(
      'completed',
    );
    expect(store.getState().minigameProgress.materials.gemstone).toBe(1);
  });

  it('lets the textual path complete AR without the duel screen', () => {
    const now = '2026-08-29T12:00:00.000Z';
    const store = createDemoStore({ now: () => now });
    store.getState().completeDiscovery();
    store.getState().completePreparation();
    store.getState().completeArByNarrative();
    expect(store.getState().stageResults.ar?.completed).toBe(true);
    expect(store.getState().stageResults.ar?.points).toBe(30);
  });
});
