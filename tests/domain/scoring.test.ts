import {
  DAVID_MISSION_MAX_POINTS,
  DAVID_PHASE_MAX_POINTS,
  calculateDavidMissionTotal,
  calculateDavidPhasePoints,
  calculateMissionScore,
  tierForScore,
} from '@/src/domain/scoring';
import { DAVID_MISSION_PHASES } from '@/src/domain/types';
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
      discovery: {
        stage: 'discovery',
        completed: true,
        points: 100,
        completedAt: 'now',
      },
      preparation: {
        stage: 'preparation',
        completed: true,
        points: 100,
        completedAt: 'now',
      },
      ar: { stage: 'ar', completed: true, points: 100, completedAt: 'now' },
      quiz: { stage: 'quiz', completed: true, points: 100, completedAt: 'now' },
    });
    expect(score.total).toBe(100);
    expect(score.tier).toBe('epic');
  });

  it('distributes exactly 100 points across four 25-point phases', () => {
    expect(DAVID_MISSION_PHASES).toEqual([
      'supplies-merge',
      'brook-skyfall',
      'david-goliath',
      'parakletos-challenge',
    ]);
    expect(
      DAVID_MISSION_PHASES.map((phase) => DAVID_PHASE_MAX_POINTS[phase]),
    ).toEqual([25, 25, 25, 25]);
    expect(
      DAVID_MISSION_PHASES.reduce(
        (total, phase) => total + DAVID_PHASE_MAX_POINTS[phase],
        0,
      ),
    ).toBe(100);
    expect(DAVID_MISSION_MAX_POINTS).toBe(100);
  });

  it('scores performance-sensitive phases and clamps aggregate results', () => {
    expect(calculateDavidPhasePoints('supplies-merge', { moves: 121 })).toBe(
      22,
    );
    expect(calculateDavidPhasePoints('brook-skyfall', { score: 250 })).toBe(5);
    expect(calculateDavidPhasePoints('david-goliath', { attempts: 4 })).toBe(
      19,
    );
    expect(
      calculateDavidMissionTotal({
        'supplies-merge': {
          phase: 'supplies-merge',
          completed: true,
          points: 999,
          completedAt: 'now',
        },
        'david-goliath': {
          phase: 'david-goliath',
          completed: true,
          points: 19,
          completedAt: 'now',
        },
      }),
    ).toBe(44);
  });
});
