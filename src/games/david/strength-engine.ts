import { PHASE_STARTING_LIVES } from './lives-engine';

export const STRENGTH_TARGET = 50;
export const STRENGTH_TOLERANCE = 7;
export const STRENGTH_SPEED = 72;

export interface StrengthState {
  position: number;
  direction: 1 | -1;
  lives: number;
  attempts: number;
  status: 'playing' | 'won' | 'lost';
}

export interface StrengthAttempt {
  state: StrengthState;
  hit: boolean;
}

export function createStrengthState(
  lives: number = PHASE_STARTING_LIVES,
): StrengthState {
  const safeLives = Math.min(
    PHASE_STARTING_LIVES,
    Math.max(0, Math.trunc(lives)),
  );
  return {
    position: 0,
    direction: 1,
    lives: safeLives,
    attempts: 0,
    status: safeLives === 0 ? 'lost' : 'playing',
  };
}

export function tickStrength(
  state: StrengthState,
  deltaMs: number,
): StrengthState {
  if (state.status !== 'playing' || deltaMs <= 0) return state;
  let position =
    state.position +
    state.direction * STRENGTH_SPEED * (Math.min(deltaMs, 100) / 1_000);
  let direction = state.direction;
  if (position >= 100) {
    position = 200 - position;
    direction = -1;
  } else if (position <= 0) {
    position = -position;
    direction = 1;
  }
  return { ...state, position, direction };
}

export function isPerfectStrength(position: number): boolean {
  return Math.abs(position - STRENGTH_TARGET) <= STRENGTH_TOLERANCE;
}

export function stopStrength(state: StrengthState): StrengthAttempt {
  if (state.status !== 'playing') return { state, hit: false };
  const attempts = state.attempts + 1;
  if (isPerfectStrength(state.position))
    return {
      hit: true,
      state: { ...state, attempts, status: 'won' },
    };

  const lives = Math.max(0, state.lives - 1);
  return {
    hit: false,
    state: {
      position: 0,
      direction: 1,
      lives,
      attempts,
      status: lives === 0 ? 'lost' : 'playing',
    },
  };
}

export function retryStrength(): StrengthState {
  return createStrengthState();
}
