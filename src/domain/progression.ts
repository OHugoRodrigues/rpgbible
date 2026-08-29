import type { MissionScore, Reward, RewardTier, Weekday, WeeklyConsistency } from '@/src/domain/types';

const WEEK: readonly Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TIER_ORDER: readonly RewardTier[] = ['common', 'rare', 'epic'];

export function createSeededConsistency(): WeeklyConsistency {
  return { activeDays: ['mon', 'tue', 'wed'], goalReached: false, completeWeek: false };
}

export function registerMeaningfulSession(consistency: WeeklyConsistency): WeeklyConsistency {
  const nextDay = WEEK.find((day) => !consistency.activeDays.includes(day));
  const activeDays = nextDay ? [...consistency.activeDays, nextDay] : [...consistency.activeDays];
  return { activeDays, goalReached: activeDays.length >= 4, completeWeek: activeDays.length === 7 };
}

export function deriveRewards(score: MissionScore, consistency: WeeklyConsistency): Reward[] {
  const shieldTier = consistency.goalReached ? maxTier(score.tier, 'rare') : score.tier;
  return [
    { id: 'stone-of-david', kind: 'collectible', name: 'Pedra de Davi', tier: 'common', source: 'Davi — A Provação', biblicalReference: '1 Samuel 17:40' },
    { id: 'shield-of-faith', kind: 'equipment', name: 'Escudo da Fé', tier: shieldTier, source: 'Meta semanal e desempenho da missão', biblicalReference: 'Efésios 6:16' },
  ];
}

function maxTier(left: RewardTier, right: RewardTier): RewardTier {
  return TIER_ORDER[Math.max(TIER_ORDER.indexOf(left), TIER_ORDER.indexOf(right))];
}
