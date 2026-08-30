import {
  createPhaseLifeState,
  losePhaseLife,
  PHASE_STARTING_LIVES,
} from './lives-engine';

export type DavidResource =
  | 'wheat'
  | 'milk'
  | 'roasted-grains'
  | 'curd'
  | 'thick-cheese'
  | 'raw-dough'
  | 'baked-bread';

export type MergeSlot = DavidResource | null;
export type RandomSource = () => number;

export interface MergeState {
  board: readonly MergeSlot[];
  lives: number;
  collectedBread: number;
  collectedCheese: number;
  status: 'playing' | 'won' | 'lost';
}

export interface MergeResult {
  state: MergeState;
  combined: boolean;
  result: DavidResource | null;
}

export const MERGE_WIN_TARGET = 3 as const;
export const DEFAULT_MERGE_CAPACITY = 25 as const;
export const MINIMUM_WINNABLE_CAPACITY = 20 as const;

const RECIPES = new Map<string, DavidResource>([
  [recipeKey('wheat', 'wheat'), 'roasted-grains'],
  [recipeKey('milk', 'milk'), 'curd'],
  [recipeKey('curd', 'curd'), 'thick-cheese'],
  [recipeKey('wheat', 'milk'), 'raw-dough'],
  [recipeKey('raw-dough', 'raw-dough'), 'baked-bread'],
]);

export function createMergeState(
  capacity: number = DEFAULT_MERGE_CAPACITY,
  resources: readonly DavidResource[] = [],
  lives: number = PHASE_STARTING_LIVES,
): MergeState {
  if (!Number.isInteger(capacity) || capacity < MINIMUM_WINNABLE_CAPACITY)
    throw new RangeError(
      `Board capacity must be at least ${MINIMUM_WINNABLE_CAPACITY}.`,
    );
  if (resources.length > capacity)
    throw new RangeError('Initial resources exceed board capacity.');

  const board: MergeSlot[] = [
    ...resources,
    ...Array.from<MergeSlot>({ length: capacity - resources.length }).fill(
      null,
    ),
  ];
  return withHarvestedBoard(board, 0, 0, createPhaseLifeState(lives).lives);
}

export function retryMergeState(
  state: MergeState,
  resources: readonly DavidResource[] = [],
): MergeState {
  return createMergeState(state.board.length, resources);
}

export function getMergeResult(
  first: DavidResource,
  second: DavidResource,
): DavidResource | null {
  return RECIPES.get(recipeKey(first, second)) ?? null;
}

export function combineMergeSlots(
  state: MergeState,
  firstIndex: number,
  secondIndex: number,
): MergeResult {
  assertSlot(state, firstIndex);
  assertSlot(state, secondIndex);
  if (
    state.status !== 'playing' ||
    firstIndex === secondIndex ||
    state.board[firstIndex] === null ||
    state.board[secondIndex] === null
  )
    return {
      state: state.status === 'playing' ? withLostLife(state) : state,
      combined: false,
      result: null,
    };

  const first = state.board[firstIndex];
  const second = state.board[secondIndex];
  if (first === null || second === null)
    return { state: withLostLife(state), combined: false, result: null };
  const result = getMergeResult(first, second);
  if (!result)
    return { state: withLostLife(state), combined: false, result: null };

  const board = [...state.board];
  board[firstIndex] = result;
  board[secondIndex] = null;
  return {
    state: withHarvestedBoard(
      board,
      state.collectedBread,
      state.collectedCheese,
      state.lives,
    ),
    combined: true,
    result,
  };
}

export function spawnMergeResource(
  state: MergeState,
  random: RandomSource,
): MergeState {
  if (state.status !== 'playing') return state;
  const emptyIndices = state.board.flatMap((slot, index) =>
    slot === null ? [index] : [],
  );
  if (emptyIndices.length === 0) return state;

  const slotRoll = normalizeRandom(random());
  const resourceRoll = normalizeRandom(random());
  const targetIndex =
    emptyIndices[Math.floor(slotRoll * emptyIndices.length)] ??
    emptyIndices[emptyIndices.length - 1];
  if (targetIndex === undefined) return state;

  const board = [...state.board];
  board[targetIndex] = resourceRoll < 0.5 ? 'wheat' : 'milk';
  return withStatus(
    board,
    state.lives,
    state.collectedBread,
    state.collectedCheese,
  );
}

export function hasWonMerge(
  collectedBread: number,
  collectedCheese: number,
): boolean {
  return (
    collectedBread >= MERGE_WIN_TARGET && collectedCheese >= MERGE_WIN_TARGET
  );
}

export function countResource(
  board: readonly MergeSlot[],
  resource: DavidResource,
): number {
  return board.filter((slot) => slot === resource).length;
}

function withHarvestedBoard(
  board: readonly MergeSlot[],
  collectedBread: number,
  collectedCheese: number,
  lives: number,
): MergeState {
  const next = [...board];
  let bread = collectedBread;
  let cheese = collectedCheese;
  for (let index = 0; index < next.length; index += 1) {
    if (next[index] === 'baked-bread') {
      bread += 1;
      next[index] = null;
    } else if (next[index] === 'thick-cheese') {
      cheese += 1;
      next[index] = null;
    }
  }
  return withStatus(
    next,
    lives,
    Math.min(MERGE_WIN_TARGET, bread),
    Math.min(MERGE_WIN_TARGET, cheese),
  );
}

function withStatus(
  board: readonly MergeSlot[],
  lives: number,
  collectedBread: number,
  collectedCheese: number,
): MergeState {
  return {
    board,
    lives,
    collectedBread,
    collectedCheese,
    status: hasWonMerge(collectedBread, collectedCheese)
      ? 'won'
      : lives === 0
        ? 'lost'
        : 'playing',
  };
}

function withLostLife(state: MergeState): MergeState {
  const lifeState = losePhaseLife({
    lives: state.lives,
    status: state.lives === 0 ? 'lost' : 'playing',
  });
  return withStatus(
    state.board,
    lifeState.lives,
    state.collectedBread,
    state.collectedCheese,
  );
}

function recipeKey(first: DavidResource, second: DavidResource): string {
  return [first, second].sort().join('+');
}

function normalizeRandom(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1 - Number.EPSILON, Math.max(0, value));
}

function assertSlot(state: MergeState, index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= state.board.length)
    throw new RangeError('Slot index is outside the board.');
}
