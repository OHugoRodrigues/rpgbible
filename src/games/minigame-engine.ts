import type {
  Material,
  MaterialInventory,
  MaterialReward,
  MinigameDefinition,
  MinigameSession,
  MinigameTransition,
  MinigameVariant,
  RecoveryMode,
} from '@/src/games/types';

export const GUIDED_READING_COOLDOWN_MS = 60 * 60 * 1_000;
export const INITIAL_LIVES = 3 as const;

export function createMaterialInventory(): MaterialInventory {
  return { straw: 0, grass: 0, wood: 0, silver: 0, gold: 0, gemstone: 0 };
}

export function addMaterialRewards(
  inventory: MaterialInventory,
  rewards: readonly MaterialReward[],
): MaterialInventory {
  return rewards.reduce(
    (next, reward) => ({
      ...next,
      [reward.material]: next[reward.material] + reward.quantity,
    }),
    { ...inventory },
  );
}

export function startMinigame(
  definition: MinigameDefinition,
  mode: MinigameSession['mode'],
  now: string,
): MinigameSession {
  const variant = definition.variants[mode];
  return {
    challengeId: definition.id,
    mode,
    status: 'active',
    startedAt: now,
    attemptStartedAt: now,
    deadlineAt: addSeconds(now, variant.timeLimitSeconds),
    completedAt: null,
    maxLives: INITIAL_LIVES,
    livesRemaining: INITIAL_LIVES,
    wrongAttempts: 0,
    recoveryCount: 0,
    lastRecoveryMode: null,
    cooldownAvailableAt: null,
    exhaustionRewardGranted: false,
    recoveryRewardGranted: false,
    reward: null,
  };
}

export function submitMinigameAnswer(
  session: MinigameSession,
  definition: MinigameDefinition,
  answer: string,
  now: string,
): MinigameTransition {
  assertStatus(session, 'active');
  const variant = definition.variants[session.mode];
  const withinTime = Date.parse(now) <= Date.parse(session.deadlineAt);
  if (!withinTime || !matches(answer, variant.acceptedAnswers))
    return loseLife(session, variant, now);

  const score = calculateCompletionScore(session, variant, now);
  const reward: MaterialReward = {
    material: materialForScore(score),
    quantity: 1,
    score,
    reason: 'completion',
  };
  return {
    correct: true,
    rewards: [reward],
    session: { ...session, status: 'completed', completedAt: now, reward },
  };
}

export function expireMinigameAttempt(
  session: MinigameSession,
  definition: MinigameDefinition,
  now: string,
): MinigameTransition {
  assertStatus(session, 'active');
  if (Date.parse(now) <= Date.parse(session.deadlineAt))
    return { session, correct: false, rewards: [] };
  return loseLife(session, definition.variants[session.mode], now);
}

export function beginMinigameRecovery(
  session: MinigameSession,
  mode: RecoveryMode,
  now: string,
): MinigameSession {
  assertStatus(session, 'recovery-required');
  return {
    ...session,
    status: mode === 'context-task' ? 'recovery-task' : 'cooldown',
    lastRecoveryMode: mode,
    cooldownAvailableAt:
      mode === 'guided-reading'
        ? new Date(Date.parse(now) + GUIDED_READING_COOLDOWN_MS).toISOString()
        : null,
  };
}

export function submitRecoveryAnswer(
  session: MinigameSession,
  definition: MinigameDefinition,
  answer: string,
  now: string,
): MinigameTransition {
  assertStatus(session, 'recovery-task');
  if (!matches(answer, definition.recoveryReading.acceptedAnswers))
    return { session, correct: false, rewards: [] };
  const rewards: MaterialReward[] = session.recoveryRewardGranted
    ? []
    : [{ material: 'grass', quantity: 1, score: 25, reason: 'recovery-task' }];
  return {
    correct: true,
    rewards,
    session: restartAttempt(
      {
        ...session,
        recoveryCount: session.recoveryCount + 1,
        recoveryRewardGranted: true,
      },
      definition.variants[session.mode],
      now,
      1,
    ),
  };
}

export function resumeAfterGuidedReading(
  session: MinigameSession,
  definition: MinigameDefinition,
  now: string,
): MinigameSession {
  assertStatus(session, 'cooldown');
  if (
    !session.cooldownAvailableAt ||
    Date.parse(now) < Date.parse(session.cooldownAvailableAt)
  )
    throw new Error('Guided reading cooldown is still active.');
  return restartAttempt(
    { ...session, recoveryCount: session.recoveryCount + 1 },
    definition.variants[session.mode],
    now,
    INITIAL_LIVES,
  );
}

function loseLife(
  session: MinigameSession,
  variant: MinigameVariant,
  now: string,
): MinigameTransition {
  const livesRemaining = Math.max(0, session.livesRemaining - 1);
  if (livesRemaining > 0) {
    return {
      correct: false,
      rewards: [],
      session: restartAttempt(
        { ...session, wrongAttempts: session.wrongAttempts + 1 },
        variant,
        now,
        livesRemaining,
      ),
    };
  }
  const rewards: MaterialReward[] = session.exhaustionRewardGranted
    ? []
    : [
        {
          material: 'straw',
          quantity: 1,
          score: 0,
          reason: 'first-exhaustion',
        },
      ];
  return {
    correct: false,
    rewards,
    session: {
      ...session,
      status: 'recovery-required',
      livesRemaining: 0,
      wrongAttempts: session.wrongAttempts + 1,
      exhaustionRewardGranted: true,
    },
  };
}

function restartAttempt(
  session: MinigameSession,
  variant: MinigameVariant,
  now: string,
  livesRemaining: number,
): MinigameSession {
  return {
    ...session,
    status: 'active',
    attemptStartedAt: now,
    deadlineAt: addSeconds(now, variant.timeLimitSeconds),
    livesRemaining,
    cooldownAvailableAt: null,
  };
}

function calculateCompletionScore(
  session: MinigameSession,
  variant: MinigameVariant,
  now: string,
): number {
  const elapsedMs = Math.max(
    0,
    Date.parse(now) - Date.parse(session.attemptStartedAt),
  );
  const timeRatio = Math.max(
    0,
    1 - elapsedMs / (variant.timeLimitSeconds * 1_000),
  );
  const raw = Math.round(
    50 + (30 * session.livesRemaining) / INITIAL_LIVES + 20 * timeRatio,
  );
  if (session.recoveryCount === 0) return Math.min(100, raw);
  return session.lastRecoveryMode === 'guided-reading'
    ? Math.min(89, raw)
    : Math.min(59, raw);
}

function materialForScore(score: number): Material {
  if (score >= 90) return 'gemstone';
  if (score >= 75) return 'gold';
  if (score >= 60) return 'silver';
  if (score >= 45) return 'wood';
  if (score >= 25) return 'grass';
  return 'straw';
}

function matches(answer: string, accepted: readonly string[]): boolean {
  const normalized = normalize(answer);
  return accepted.some((candidate) => normalize(candidate) === normalized);
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function addSeconds(iso: string, seconds: number): string {
  return new Date(Date.parse(iso) + seconds * 1_000).toISOString();
}

function assertStatus(
  session: MinigameSession,
  status: MinigameSession['status'],
): void {
  if (session.status !== status)
    throw new Error(
      `Expected minigame status ${status}, received ${session.status}.`,
    );
}
