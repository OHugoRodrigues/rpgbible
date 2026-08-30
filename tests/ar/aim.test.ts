import { isStoneAimHit, nextStoneAim } from '@/src/ar/aim';
import { describe, expect, it } from 'vitest';

describe('stone aim', () => {
  it('hits only inside the golden band', () => {
    expect(isStoneAimHit(68)).toBe(true);
    expect(isStoneAimHit(58)).toBe(true);
    expect(isStoneAimHit(78)).toBe(true);
    expect(isStoneAimHit(40)).toBe(false);
  });

  it('reverses at the edges of the track', () => {
    expect(nextStoneAim(97, 1)).toEqual({ aim: 98, direction: -1 });
    expect(nextStoneAim(3, -1)).toEqual({ aim: 2, direction: 1 });
  });
});
