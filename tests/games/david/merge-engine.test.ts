import {
  combineMergeSlots,
  createMergeState,
  getMergeResult,
  hasWonMerge,
  retryMergeState,
  spawnMergeResource,
  type DavidResource,
} from '@/src/games/david/merge-engine';
import { describe, expect, it } from 'vitest';

describe('merge engine', () => {
  it.each([
    ['wheat', 'wheat', 'roasted-grains'],
    ['milk', 'milk', 'curd'],
    ['curd', 'curd', 'thick-cheese'],
    ['wheat', 'milk', 'raw-dough'],
    ['raw-dough', 'raw-dough', 'baked-bread'],
  ] as const)('combines %s + %s into %s', (first, second, result) => {
    expect(getMergeResult(first, second)).toBe(result);
    expect(getMergeResult(second, first)).toBe(result);
  });

  it('rejects combinations outside the exact recipe list', () => {
    expect(getMergeResult('baked-bread', 'baked-bread')).toBeNull();
    const state = createMergeState(20, ['wheat', 'curd']);
    const transition = combineMergeSlots(state, 0, 1);
    expect(transition.combined).toBe(false);
    expect(transition.state.board).toBe(state.board);
    expect(transition.state.lives).toBe(2);
  });

  it('combines slots immutably without changing board capacity', () => {
    const state = createMergeState(20, ['wheat', 'milk']);
    const transition = combineMergeSlots(state, 0, 1);
    expect(transition.combined).toBe(true);
    expect(transition.result).toBe('raw-dough');
    expect(transition.state.board).toHaveLength(20);
    expect(transition.state.board.slice(0, 2)).toEqual(['raw-dough', null]);
    expect(state.board.slice(0, 2)).toEqual(['wheat', 'milk']);
  });

  it('spawns deterministically into an empty slot and never overflows', () => {
    const rolls = [0.99, 0.75];
    const random = () => rolls.shift() ?? 0;
    const state = createMergeState(20);
    const spawned = spawnMergeResource(state, random);
    expect(spawned.board[19]).toBe('milk');
    expect(spawned.board).toHaveLength(20);

    const full = createMergeState(
      20,
      Array.from({ length: 20 }, () => 'wheat' as DavidResource),
    );
    expect(spawnMergeResource(full, () => 0)).toBe(full);
  });

  it('requires a board large enough for a possible win', () => {
    expect(() => createMergeState(19)).toThrow('at least 20');
  });

  it('removes finished bread and cheese from the board when formed', () => {
    const bread = combineMergeSlots(
      createMergeState(20, ['raw-dough', 'raw-dough']),
      0,
      1,
    );
    expect(bread.result).toBe('baked-bread');
    expect(bread.state.board.slice(0, 2)).toEqual([null, null]);
    expect(bread.state.collectedBread).toBe(1);
    expect(bread.state.status).toBe('playing');

    const cheese = combineMergeSlots(
      createMergeState(20, ['curd', 'curd']),
      0,
      1,
    );
    expect(cheese.result).toBe('thick-cheese');
    expect(cheese.state.board.slice(0, 2)).toEqual([null, null]);
    expect(cheese.state.collectedCheese).toBe(1);
  });

  it('wins with three breads and three cheeses and cannot mutate afterward', () => {
    const resources: DavidResource[] = [
      ...Array.from({ length: 3 }, () => 'baked-bread' as const),
      ...Array.from({ length: 3 }, () => 'thick-cheese' as const),
    ];
    const state = createMergeState(20, resources);
    expect(hasWonMerge(state.collectedBread, state.collectedCheese)).toBe(
      true,
    );
    expect(state.collectedBread).toBe(3);
    expect(state.collectedCheese).toBe(3);
    expect(state.board.slice(0, 6).every((slot) => slot === null)).toBe(true);
    expect(state.status).toBe('won');
    expect(spawnMergeResource(state, () => 0)).toBe(state);
    expect(combineMergeSlots(state, 0, 1).state).toBe(state);
  });

  it('loses after three invalid recipes, freezes, and retries cleanly', () => {
    let state = createMergeState(20, ['wheat', 'curd']);
    state = combineMergeSlots(state, 0, 1).state;
    state = combineMergeSlots(state, 0, 1).state;
    state = combineMergeSlots(state, 0, 1).state;

    expect(state).toMatchObject({ lives: 0, status: 'lost' });
    expect(combineMergeSlots(state, 0, 1).state).toBe(state);
    expect(spawnMergeResource(state, () => 0)).toBe(state);

    const retried = retryMergeState(state, ['milk', 'milk']);
    expect(retried).toMatchObject({ lives: 3, status: 'playing' });
    expect(retried.board.slice(0, 2)).toEqual(['milk', 'milk']);
  });
});
