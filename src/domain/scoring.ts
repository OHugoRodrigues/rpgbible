import {
  DAVID_MISSION_PHASES,
  type DavidPhaseId,
  type DavidPhaseResult,
  type DavidMissionPhaseId,
  type MissionScore,
  type RewardTier,
  type SerializableValue,
  type StageResult,
} from '@/src/domain/types';

export const STAGE_MAX_POINTS = {
  discovery: 20,
  preparation: 20,
  ar: 30,
  quiz: 30,
} as const;
export const DAVID_PHASE_MAX_POINTS: Readonly<
  Record<DavidMissionPhaseId, number>
> = {
  'supplies-merge': 25,
  'brook-skyfall': 25,
  'david-goliath': 25,
  'parakletos-challenge': 25,
};

export const DAVID_MISSION_MAX_POINTS = DAVID_MISSION_PHASES.reduce(
  (total, phase) => total + DAVID_PHASE_MAX_POINTS[phase],
  0,
);

export function tierForScore(total: number): RewardTier {
  if (total >= 85) return 'epic';
  if (total >= 60) return 'rare';
  return 'common';
}

export function calculateMissionScore(
  results: Partial<
    Record<'discovery' | 'preparation' | 'ar' | 'quiz', StageResult>
  >,
): MissionScore {
  const discovery = clamp(
    results.discovery?.points ?? 0,
    0,
    STAGE_MAX_POINTS.discovery,
  );
  const preparation = clamp(
    results.preparation?.points ?? 0,
    0,
    STAGE_MAX_POINTS.preparation,
  );
  const ar = clamp(results.ar?.points ?? 0, 0, STAGE_MAX_POINTS.ar);
  const quiz = clamp(results.quiz?.points ?? 0, 0, STAGE_MAX_POINTS.quiz);
  const total = discovery + preparation + ar + quiz;
  return { discovery, preparation, ar, quiz, total, tier: tierForScore(total) };
}

export function calculateDavidMissionTotal(
  results: Partial<Record<DavidMissionPhaseId, DavidPhaseResult>>,
): number {
  return DAVID_MISSION_PHASES.reduce(
    (total, phase) =>
      total +
      clamp(results[phase]?.points ?? 0, 0, DAVID_PHASE_MAX_POINTS[phase]),
    0,
  );
}

export function calculateDavidPhasePoints(
  phase: DavidPhaseId,
  data: SerializableValue,
): number {
  if (!isDavidMissionPhase(phase)) return 0;
  const maximum = DAVID_PHASE_MAX_POINTS[phase];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return maximum;

  if (phase === 'supplies-merge') {
    const moves = numericValue(data.moves);
    return moves === null
      ? maximum
      : clamp(maximum - Math.floor(Math.max(0, moves - 60) / 20), 5, maximum);
  }
  if (phase === 'brook-skyfall') {
    const score = numericValue(data.score);
    return score === null ? maximum : clamp(Math.round(score / 50), 5, maximum);
  }
  if (phase === 'david-goliath') {
    const attempts = numericValue(data.attempts);
    return attempts === null
      ? maximum
      : clamp(maximum - Math.max(0, attempts - 1) * 2, 15, maximum);
  }
  return maximum;
}

function isDavidMissionPhase(
  phase: DavidPhaseId,
): phase is DavidMissionPhaseId {
  return (DAVID_MISSION_PHASES as readonly string[]).includes(phase);
}

function numericValue(value: SerializableValue | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
