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
    const store = createDemoStore({ storage: createJSONStorage<DemoState>(memoryStorage), now: clock });
    store.getState().goTo('journeys');
    expect(store.getState().currentStep).toBe('journeys');
    store.getState().resetDemo();
    expect(store.getState().currentStep).toBe('home');
    expect(store.getState().consistency.activeDays).toEqual(['mon', 'tue', 'wed']);
  });
});
