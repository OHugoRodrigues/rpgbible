import type {
  MissionScore,
  Reward,
  RewardTier,
  Weekday,
  WeeklyConsistency,
} from '@/src/domain/types';

const WEEK: readonly Weekday[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];
const TIER_ORDER: readonly RewardTier[] = ['common', 'rare', 'epic'];

/** Meta semanal da spec §7: 4 dias edificam, 7 dias completam a semana. */
export const WEEKLY_GOAL_DAYS = 4;
export const WEEK_LENGTH = 7;

export function createSeededConsistency(): WeeklyConsistency {
  return {
    activeDays: ['mon', 'tue', 'wed'],
    goalReached: false,
    completeWeek: false,
  };
}

export function registerMeaningfulSession(
  consistency: WeeklyConsistency,
): WeeklyConsistency {
  const nextDay = WEEK.find((day) => !consistency.activeDays.includes(day));
  const activeDays = nextDay
    ? [...consistency.activeDays, nextDay]
    : [...consistency.activeDays];
  return {
    activeDays,
    goalReached: activeDays.length >= WEEKLY_GOAL_DAYS,
    completeWeek: activeDays.length === WEEK_LENGTH,
  };
}

/**
 * Recompensa da missão "A Provação".
 *
 * As duas economias da spec §6 são deliberadamente distintas: o colecionável é
 * memória da história e não tem raridade variável; o equipamento é evolução do
 * Peregrino e sobe de qualidade por desempenho e constância. A semana completa
 * (7/7) leva o equipamento ao topo — nunca punindo semanas incompletas.
 */
export function deriveRewards(
  score: MissionScore,
  consistency: WeeklyConsistency,
): Reward[] {
  return [
    {
      id: 'stone-of-david',
      kind: 'collectible',
      name: 'Pedra de Davi',
      tier: 'common',
      source: 'Davi — A Provação',
      biblicalReference: '1 Samuel 17:40',
    },
    {
      id: 'shield-of-faith',
      kind: 'equipment',
      name: 'Escudo da Fé',
      tier: equipmentTier(score.tier, consistency),
      source: 'Meta semanal e desempenho da missão',
      biblicalReference: 'Efésios 6:16',
    },
  ];
}

export function deriveDavidMissionRewards(
  score: MissionScore,
  consistency: WeeklyConsistency,
): Reward[] {
  return [
    ...deriveRewards(score, consistency),
    {
      id: 'courage-to-trust',
      kind: 'achievement',
      name: 'CORAGEM PARA CONFIAR',
      tier: 'epic',
      source: 'Davi — A coragem de confiar',
      biblicalReference: '1 Samuel 17:45-50',
    },
  ];
}

/** 7/7 garante o topo; 4/7 garante ao menos `rare`; abaixo disso vale o desempenho. */
export function equipmentTier(
  scoreTier: RewardTier,
  consistency: WeeklyConsistency,
): RewardTier {
  if (consistency.completeWeek) return 'epic';
  if (consistency.goalReached) return maxTier(scoreTier, 'rare');
  return scoreTier;
}

function maxTier(left: RewardTier, right: RewardTier): RewardTier {
  return TIER_ORDER[
    Math.max(TIER_ORDER.indexOf(left), TIER_ORDER.indexOf(right))
  ];
}
