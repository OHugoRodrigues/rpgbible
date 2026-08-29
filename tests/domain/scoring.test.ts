import { calculateMissionScore, tierForScore } from '@/src/domain/scoring';
import { describe, expect, it } from 'vitest';

describe('mission scoring', () => {
  it('applies the documented thresholds', () => {
    expect(tierForScore(59)).toBe('common');
    expect(tierForScore(60)).toBe('rare');
    expect(tierForScore(84)).toBe('rare');
    expect(tierForScore(85)).toBe('epic');
  });

  it('caps every stage at its maximum', () => {
    const score = calculateMissionScore({
      discovery: { stage: 'discovery', completed: true, points: 100, completedAt: 'now' },
      preparation: { stage: 'preparation', completed: true, points: 100, completedAt: 'now' },
      ar: { stage: 'ar', completed: true, points: 100, completedAt: 'now' },
      quiz: { stage: 'quiz', completed: true, points: 100, completedAt: 'now' },
    });
    expect(score.total).toBe(100);
    expect(score.tier).toBe('epic');
  });
});
