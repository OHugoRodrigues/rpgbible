import type { MissionScore, RewardTier, StageResult } from '@/src/domain/types';

export const STAGE_MAX_POINTS = { discovery: 20, preparation: 20, ar: 30, quiz: 30 } as const;

export function tierForScore(total: number): RewardTier {
  if (total >= 85) return 'epic';
  if (total >= 60) return 'rare';
  return 'common';
}

export function calculateMissionScore(
  results: Partial<Record<'discovery' | 'preparation' | 'ar' | 'quiz', StageResult>>,
): MissionScore {
  const discovery = clamp(results.discovery?.points ?? 0, 0, STAGE_MAX_POINTS.discovery);
  const preparation = clamp(results.preparation?.points ?? 0, 0, STAGE_MAX_POINTS.preparation);
  const ar = clamp(results.ar?.points ?? 0, 0, STAGE_MAX_POINTS.ar);
  const quiz = clamp(results.quiz?.points ?? 0, 0, STAGE_MAX_POINTS.quiz);
  const total = discovery + preparation + ar + quiz;
  return { discovery, preparation, ar, quiz, total, tier: tierForScore(total) };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
