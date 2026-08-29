import { createDemoStore } from '@/src/application/store';
import type { DemoState } from '@/src/domain/types';
import { createJSONStorage } from 'zustand/middleware';

export function createBrowserDemoStore() {
  if (typeof window === 'undefined') throw new Error('Browser demo store can only be created in a client runtime.');
  return createDemoStore({ storage: createJSONStorage<DemoState>(() => window.localStorage) });
}
