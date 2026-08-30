import {
  createPhaseLifeState,
  losePhaseLife,
  PHASE_STARTING_LIVES,
  retryPhaseLives,
} from '@/src/games/david/lives-engine';
import { describe, expect, it } from 'vitest';

describe('lives engine', () => {
  it('starts every phase with three lives', () => {
    expect(createPhaseLifeState()).toEqual({
      lives: PHASE_STARTING_LIVES,
      status: 'playing',
    });
  });

  it('loses one life at a time and freezes at zero', () => {
    let state = createPhaseLifeState();
    state = losePhaseLife(state);
    state = losePhaseLife(state);
    state = losePhaseLife(state);

    expect(state).toEqual({ lives: 0, status: 'lost' });
    expect(losePhaseLife(state)).toBe(state);
  });

  it('restores all lives on retry', () => {
    expect(retryPhaseLives()).toEqual(createPhaseLifeState());
  });
});
