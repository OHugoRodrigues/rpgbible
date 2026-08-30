import {
  DEFAULT_SKYFALL_CONFIG,
  addSkyfallObject,
  createSeededRandom,
  createSkyfallGenerator,
  createSkyfallState,
  moveSkyfallPlayer,
  retrySkyfallState,
  tickSkyfall,
} from '@/src/games/david/skyfall-engine';
import { describe, expect, it } from 'vitest';

describe('skyfall engine', () => {
  it('moves the player while clamping X to the play area', () => {
    const state = createSkyfallState();
    expect(moveSkyfallPlayer(state, -1_000).player.x).toBe(
      state.config.playerRadius,
    );
    expect(moveSkyfallPlayer(state, 1_000).player.x).toBe(
      state.config.width - state.config.playerRadius,
    );
    expect(state.player.x).toBe(state.config.width / 2);
  });

  it('advances falling objects using delta time', () => {
    const state = addSkyfallObject(createSkyfallState(), {
      kind: 'smooth-stone',
      x: 20,
      speed: 100,
      radius: 10,
    });
    const ticked = tickSkyfall(state, 500);
    expect(ticked.objects[0]?.y).toBe(40);
    expect(state.objects[0]?.y).toBe(-10);
  });

  it('collects exactly five smooth stones and wins', () => {
    let state = createSkyfallState();
    for (let count = 0; count < 6; count += 1) {
      state = addSkyfallObject(state, {
        kind: 'smooth-stone',
        x: state.player.x,
        speed: 500,
        radius: 10,
      });
      state = tickSkyfall(state, 1_000);
    }
    expect(state.smoothStones).toBe(5);
    expect(state.status).toBe('won');
    expect(state.score).toBe(5 * state.config.stoneScore);
  });

  it('penalizes obstacle collisions without negative score and accelerates', () => {
    const initial = createSkyfallState();
    const state = addSkyfallObject(initial, {
      kind: 'obstacle',
      x: initial.player.x,
      speed: 500,
      radius: 16,
    });
    const ticked = tickSkyfall(state, 1_000);
    expect(ticked.score).toBe(0);
    expect(ticked.speedMultiplier).toBe(
      1 + initial.config.obstacleAcceleration,
    );
    expect(ticked.lives).toBe(2);
    expect(ticked.objects).toHaveLength(0);
  });

  it('loses on the third obstacle, freezes, and retries from scratch', () => {
    let state = createSkyfallState();
    for (let collision = 0; collision < 3; collision += 1) {
      state = addSkyfallObject(state, {
        kind: 'obstacle',
        x: state.player.x,
        speed: 500,
        radius: 16,
      });
      state = tickSkyfall(state, 1_000);
    }

    expect(state).toMatchObject({ lives: 0, status: 'lost' });
    expect(tickSkyfall(state, 1_000)).toBe(state);
    expect(moveSkyfallPlayer(state, 10)).toBe(state);

    const retried = retrySkyfallState(state);
    expect(retried).toMatchObject({
      lives: 3,
      smoothStones: 0,
      score: 0,
      speedMultiplier: 1,
      status: 'playing',
    });
    expect(retried.objects).toEqual([]);
  });

  it('supports reproducible seeded generation', () => {
    const firstGenerator = createSkyfallGenerator(createSeededRandom(42));
    const secondGenerator = createSkyfallGenerator(createSeededRandom(42));
    const state = createSkyfallState({
      ...DEFAULT_SKYFALL_CONFIG,
      spawnChancePerSecond: 10,
    });
    expect(firstGenerator({ state, deltaMs: 1_000 })).toEqual(
      secondGenerator({ state, deltaMs: 1_000 }),
    );
  });

  it('accepts an injected generator during a tick', () => {
    const state = createSkyfallState();
    const ticked = tickSkyfall(state, 100, () => ({
      kind: 'smooth-stone',
      x: 25,
      speed: 100,
      radius: 10,
    }));
    expect(ticked.objects).toEqual([
      expect.objectContaining({ id: 1, x: 25, y: 0 }),
    ]);
    expect(ticked.nextObjectId).toBe(2);
  });
});
