import {
  createStrengthState,
  isPerfectStrength,
  retryStrength,
  stopStrength,
  tickStrength,
} from '@/src/games/david/strength-engine';
import { describe, expect, it } from 'vitest';

describe('strength engine', () => {
  it('moves and reverses the indicator', () => {
    const moved = tickStrength(createStrengthState(), 100);
    expect(moved.position).toBeGreaterThan(0);
    const reversed = tickStrength(
      { ...moved, position: 99, direction: 1 },
      100,
    );
    expect(reversed.direction).toBe(-1);
    expect(reversed.position).toBeLessThan(100);
  });

  it('accepts only the center target', () => {
    expect(isPerfectStrength(50)).toBe(true);
    expect(isPerfectStrength(57)).toBe(true);
    expect(isPerfectStrength(58)).toBe(false);
    expect(stopStrength({ ...createStrengthState(), position: 50 }).hit).toBe(
      true,
    );
  });

  it('loses one life per miss and freezes after three', () => {
    let state = createStrengthState();
    for (let attempt = 0; attempt < 3; attempt += 1)
      state = stopStrength({ ...state, position: 10 }).state;
    expect(state.lives).toBe(0);
    expect(state.status).toBe('lost');
    expect(tickStrength(state, 100)).toBe(state);
    expect(retryStrength()).toEqual(createStrengthState());
  });
});
