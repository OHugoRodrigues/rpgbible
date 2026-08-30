import {
  WEEKLY_GOAL_DAYS,
  createSeededConsistency,
  deriveDavidMissionRewards,
  deriveRewards,
  equipmentTier,
  registerMeaningfulSession,
} from '@/src/domain/progression';
import type { MissionScore, WeeklyConsistency } from '@/src/domain/types';
import { describe, expect, it } from 'vitest';

function consistencyWith(days: number): WeeklyConsistency {
  const all = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const activeDays = all.slice(0, days);
  return {
    activeDays: [...activeDays],
    goalReached: days >= WEEKLY_GOAL_DAYS,
    completeWeek: days === all.length,
  };
}

const score = (tier: MissionScore['tier']): MissionScore => ({
  discovery: 20,
  preparation: 20,
  ar: 30,
  quiz: 10,
  total: 80,
  tier,
});

describe('constância semanal', () => {
  it('parte de três dias seedados, como o piloto permite', () => {
    const seeded = createSeededConsistency();
    expect(seeded.activeDays).toHaveLength(3);
    expect(seeded.goalReached).toBe(false);
  });

  it('atinge a meta no quarto dia', () => {
    const next = registerMeaningfulSession(createSeededConsistency());
    expect(next.activeDays).toHaveLength(WEEKLY_GOAL_DAYS);
    expect(next.goalReached).toBe(true);
    expect(next.completeWeek).toBe(false);
  });

  it('não passa de sete dias nem regride ao repetir a sessão', () => {
    let consistency = createSeededConsistency();
    for (let index = 0; index < 10; index += 1)
      consistency = registerMeaningfulSession(consistency);
    expect(consistency.activeDays).toHaveLength(7);
    expect(consistency.completeWeek).toBe(true);
  });
});

describe('qualidade do equipamento', () => {
  it('segue o desempenho quando a meta ainda não foi atingida', () => {
    expect(equipmentTier('common', consistencyWith(3))).toBe('common');
  });

  it('garante ao menos qualidade rara com a meta de quatro dias', () => {
    expect(equipmentTier('common', consistencyWith(4))).toBe('rare');
  });

  it('nunca rebaixa um desempenho melhor que a meta', () => {
    expect(equipmentTier('epic', consistencyWith(4))).toBe('epic');
  });

  it('leva ao topo na semana completa', () => {
    expect(equipmentTier('common', consistencyWith(7))).toBe('epic');
  });
});

describe('recompensas da missão', () => {
  it('entrega uma memória da história e uma evolução do Peregrino', () => {
    const rewards = deriveRewards(score('rare'), consistencyWith(4));
    expect(rewards.map((reward) => reward.kind)).toEqual([
      'collectible',
      'equipment',
    ]);
    expect(rewards[0].tier).toBe('common');
  });

  it('mantém o colecionável fora da escala de raridade', () => {
    const weak = deriveRewards(score('common'), consistencyWith(3));
    const strong = deriveRewards(score('epic'), consistencyWith(7));
    expect(weak[0].tier).toBe(strong[0].tier);
    expect(weak[1].tier).not.toBe(strong[1].tier);
  });

  it('inclui a conquista Coragem para Confiar ao concluir a trilha', () => {
    const rewards = deriveDavidMissionRewards(
      score('epic'),
      consistencyWith(4),
    );
    expect(rewards).toContainEqual(
      expect.objectContaining({
        id: 'courage-to-trust',
        kind: 'achievement',
        name: 'CORAGEM PARA CONFIAR',
      }),
    );
  });
});
