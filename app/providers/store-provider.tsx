'use client';

import { createBrowserDemoStore } from '@/src/application/browser-storage';
import { createDemoStore, type DemoStore } from '@/src/application/store';
import type { DemoState } from '@/src/domain/types';
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { PersistStorage } from 'zustand/middleware';
import type { StoreApi } from 'zustand/vanilla';

const StoreContext = createContext<StoreApi<DemoStore> | null>(null);

/** No servidor não há `localStorage`; o estado inicial basta para o SSR. */
const serverStorage: PersistStorage<DemoState> = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

let clientStore: StoreApi<DemoStore> | null = null;

function resolveStore(): StoreApi<DemoStore> {
  if (typeof window === 'undefined') return createDemoStore({ storage: serverStorage });
  clientStore ??= createBrowserDemoStore();
  return clientStore;
}

/**
 * Fornece o store persistido do domínio.
 *
 * O contrato de `docs/frontend-handoff.md` é que a interface não duplique
 * score, recompensa, constância ou validação — tudo vem daqui.
 */
export function DemoStoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext value={resolveStore()}>{children}</StoreContext>;
}

export function useDemoStore<T>(selector: (state: DemoStore) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useDemoStore precisa estar dentro de <DemoStoreProvider>.');
  return useStore(store, selector);
}

/** Ações do domínio. A identidade é estável, então dispensa seletor. */
export function useDemoActions(): DemoStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useDemoActions precisa estar dentro de <DemoStoreProvider>.');
  return store.getState();
}

const neverChanges = () => () => undefined;

/**
 * `false` no servidor e no primeiro render do cliente, `true` depois — evita
 * divergência de hidratação antes de o `persist` restaurar o estado salvo.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}
