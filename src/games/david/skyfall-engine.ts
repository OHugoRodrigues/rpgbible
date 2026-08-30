import {
  createPhaseLifeState,
  losePhaseLife,
  PHASE_STARTING_LIVES,
} from './lives-engine';

export type SkyfallObjectKind = 'smooth-stone' | 'obstacle';
export type SkyfallStatus = 'playing' | 'won' | 'lost';
export type SkyfallRandom = () => number;

export interface SkyfallConfig {
  width: number;
  height: number;
  playerY: number;
  playerRadius: number;
  targetStones: 5;
  stoneScore: number;
  obstaclePenalty: number;
  obstacleAcceleration: number;
  spawnChancePerSecond: number;
}

export interface SkyfallPlayer {
  x: number;
}

export interface FallingObject {
  id: number;
  kind: SkyfallObjectKind;
  x: number;
  y: number;
  speed: number;
  radius: number;
  obstacleShape?: 'jagged-stone' | 'branch';
}

export interface SkyfallSpawn {
  kind: SkyfallObjectKind;
  x: number;
  speed: number;
  radius: number;
  obstacleShape?: 'jagged-stone' | 'branch';
}

export interface SkyfallState {
  player: SkyfallPlayer;
  objects: readonly FallingObject[];
  smoothStones: number;
  score: number;
  lives: number;
  speedMultiplier: number;
  nextObjectId: number;
  status: SkyfallStatus;
  config: Readonly<SkyfallConfig>;
}

export interface SkyfallTickContext {
  state: SkyfallState;
  deltaMs: number;
}

export type SkyfallGenerator = (
  context: SkyfallTickContext,
) => SkyfallSpawn | null;

export const DEFAULT_SKYFALL_CONFIG: Readonly<SkyfallConfig> = {
  width: 320,
  height: 480,
  playerY: 440,
  playerRadius: 18,
  targetStones: 5,
  stoneScore: 100,
  obstaclePenalty: 50,
  obstacleAcceleration: 0.15,
  spawnChancePerSecond: 1.5,
};

export function createSkyfallState(
  config: SkyfallConfig = DEFAULT_SKYFALL_CONFIG,
): SkyfallState {
  assertConfig(config);
  return {
    player: { x: config.width / 2 },
    objects: [],
    smoothStones: 0,
    score: 0,
    lives: PHASE_STARTING_LIVES,
    speedMultiplier: 1,
    nextObjectId: 1,
    status: 'playing',
    config: { ...config },
  };
}

export function retrySkyfallState(state: SkyfallState): SkyfallState {
  return createSkyfallState({ ...state.config });
}

export function moveSkyfallPlayer(
  state: SkyfallState,
  deltaX: number,
): SkyfallState {
  if (!Number.isFinite(deltaX))
    throw new RangeError('Player movement must be finite.');
  if (state.status !== 'playing') return state;
  const radius = state.config.playerRadius;
  const x = clamp(state.player.x + deltaX, radius, state.config.width - radius);
  return { ...state, player: { x } };
}

export function addSkyfallObject(
  state: SkyfallState,
  spawn: SkyfallSpawn,
): SkyfallState {
  assertSpawn(spawn, state.config.width);
  if (state.status !== 'playing') return state;
  return {
    ...state,
    nextObjectId: state.nextObjectId + 1,
    objects: [
      ...state.objects,
      { ...spawn, id: state.nextObjectId, y: -spawn.radius },
    ],
  };
}

export function tickSkyfall(
  state: SkyfallState,
  deltaMs: number,
  generator?: SkyfallGenerator,
): SkyfallState {
  if (!Number.isFinite(deltaMs) || deltaMs < 0)
    throw new RangeError('Tick delta must be a non-negative finite number.');
  if (state.status !== 'playing' || deltaMs === 0) return state;

  let working = state;
  const spawn = generator?.({ state, deltaMs }) ?? null;
  if (spawn) working = addSkyfallObject(working, spawn);

  const seconds = deltaMs / 1_000;
  const remaining: FallingObject[] = [];
  let smoothStones = working.smoothStones;
  let score = working.score;
  let lives = working.lives;
  let speedMultiplier = working.speedMultiplier;

  for (const object of working.objects) {
    const nextY = object.y + object.speed * speedMultiplier * seconds;
    const collided =
      Math.abs(object.x - working.player.x) <=
        object.radius + working.config.playerRadius &&
      object.y <= working.config.playerY + working.config.playerRadius &&
      nextY >= working.config.playerY - working.config.playerRadius;

    if (collided) {
      if (object.kind === 'smooth-stone') {
        smoothStones = Math.min(working.config.targetStones, smoothStones + 1);
        score += working.config.stoneScore;
      } else {
        score = Math.max(0, score - working.config.obstaclePenalty);
        lives = losePhaseLife(createPhaseLifeState(lives)).lives;
        speedMultiplier += working.config.obstacleAcceleration;
      }
    } else if (nextY - object.radius <= working.config.height) {
      remaining.push({ ...object, y: nextY });
    }
  }

  return {
    ...working,
    objects: remaining,
    smoothStones,
    score,
    lives,
    speedMultiplier,
    status:
      lives === 0
        ? 'lost'
        : smoothStones >= working.config.targetStones
          ? 'won'
          : 'playing',
  };
}

export function createSeededRandom(seed: number): SkyfallRandom {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0;
    return value / 0x1_0000_0000;
  };
}

export function createSkyfallGenerator(
  random: SkyfallRandom,
): SkyfallGenerator {
  return ({ state, deltaMs }) => {
    const chance = Math.min(
      1,
      (state.config.spawnChancePerSecond * deltaMs) / 1_000,
    );
    if (normalizeRandom(random()) >= chance) return null;
    const kind: SkyfallObjectKind =
      normalizeRandom(random()) < 0.65 ? 'smooth-stone' : 'obstacle';
    const obstacleShape =
      kind === 'obstacle'
        ? normalizeRandom(random()) < 0.5
          ? 'jagged-stone'
          : 'branch'
        : undefined;
    const radius = kind === 'smooth-stone' ? 10 : 16;
    return {
      kind,
      radius,
      speed: kind === 'smooth-stone' ? 150 : 190,
      x: radius + normalizeRandom(random()) * (state.config.width - radius * 2),
      obstacleShape,
    };
  };
}

function assertConfig(config: SkyfallConfig): void {
  if (
    !Number.isFinite(config.width) ||
    !Number.isFinite(config.height) ||
    config.width <= 0 ||
    config.height <= 0 ||
    !Number.isFinite(config.playerY) ||
    config.playerY < 0 ||
    config.playerY > config.height ||
    !Number.isFinite(config.playerRadius) ||
    config.playerRadius <= 0 ||
    config.targetStones !== 5 ||
    !Number.isFinite(config.stoneScore) ||
    config.stoneScore < 0 ||
    !Number.isFinite(config.obstaclePenalty) ||
    config.obstaclePenalty < 0 ||
    !Number.isFinite(config.obstacleAcceleration) ||
    config.obstacleAcceleration < 0 ||
    !Number.isFinite(config.spawnChancePerSecond) ||
    config.spawnChancePerSecond < 0
  )
    throw new RangeError('Skyfall config values are invalid.');
}

function assertSpawn(spawn: SkyfallSpawn, width: number): void {
  if (
    !Number.isFinite(spawn.x) ||
    spawn.x < 0 ||
    spawn.x > width ||
    !Number.isFinite(spawn.speed) ||
    spawn.speed <= 0 ||
    !Number.isFinite(spawn.radius) ||
    spawn.radius <= 0
  )
    throw new RangeError('Skyfall spawn values are invalid.');
}

function normalizeRandom(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clamp(value, 0, 1 - Number.EPSILON);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
