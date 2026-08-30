export const PHASE_STARTING_LIVES = 3 as const;

export type PhaseLifeStatus = 'playing' | 'lost';

export interface PhaseLifeState {
  lives: number;
  status: PhaseLifeStatus;
}

export function createPhaseLifeState(
  lives: number = PHASE_STARTING_LIVES,
): PhaseLifeState {
  const normalizedLives = normalizeLives(lives);
  return {
    lives: normalizedLives,
    status: normalizedLives === 0 ? 'lost' : 'playing',
  };
}

export function losePhaseLife(state: PhaseLifeState): PhaseLifeState {
  if (state.status === 'lost') return state;
  return createPhaseLifeState(state.lives - 1);
}

export function retryPhaseLives(): PhaseLifeState {
  return createPhaseLifeState();
}

function normalizeLives(lives: number): number {
  if (!Number.isInteger(lives))
    throw new RangeError('Lives must be an integer.');
  return Math.min(PHASE_STARTING_LIVES, Math.max(0, lives));
}
