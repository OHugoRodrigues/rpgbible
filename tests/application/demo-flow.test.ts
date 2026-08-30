import {
  canResumeDemo,
  experienceModeOf,
  parakletosStageFor,
  resumeDemoStep,
  skipsArDuel,
  stepAfterPreparation,
  usesTrialMinigame,
} from '@/src/application/demo-flow';
import { createInitialDemoState } from '@/src/application/demo-engine';
import { describe, expect, it } from 'vitest';

describe('demo flow', () => {
  it('maps hub steps to chosen and mission steps to trial', () => {
    expect(parakletosStageFor('journeys', false)).toBe('chosen');
    expect(parakletosStageFor('discovery', false)).toBe('trial');
    expect(parakletosStageFor('minigame', false)).toBe('trial');
    expect(parakletosStageFor('profile', false)).toBe('legacy');
    expect(parakletosStageFor('home', true)).toBe('chosen');
    expect(parakletosStageFor('david-mission', false, 'supplies-merge')).toBe(
      'trial',
    );
    expect(parakletosStageFor('david-mission', false, 'brook-skyfall')).toBe(
      'trial',
    );
    expect(parakletosStageFor('david-mission', false, 'david-goliath')).toBe(
      'trial',
    );
    expect(
      parakletosStageFor('david-mission', false, 'parakletos-challenge'),
    ).toBe('trial');
  });

  it('sends gamified and balanced modes through the trial minigame', () => {
    expect(usesTrialMinigame('gamified')).toBe(true);
    expect(usesTrialMinigame('balanced')).toBe(true);
    expect(usesTrialMinigame('textual')).toBe(false);
    expect(stepAfterPreparation('textual')).toBe('quiz');
    expect(skipsArDuel('textual')).toBe(true);
    expect(stepAfterPreparation('gamified')).toBe('minigame');
  });

  it('resumes a finished mission on chapters and an in-progress one from home', () => {
    const now = '2026-08-29T12:00:00.000Z';
    const fresh = createInitialDemoState(now);
    expect(canResumeDemo(fresh)).toBe(false);
    expect(experienceModeOf(fresh)).toBe('balanced');

    const done = {
      ...fresh,
      missionCompleted: true,
      currentStep: 'home' as const,
    };
    expect(canResumeDemo(done)).toBe(true);
    expect(resumeDemoStep(done)).toBe('chapters');

    const mid = {
      ...fresh,
      currentStep: 'home' as const,
      stageResults: {
        discovery: {
          stage: 'discovery' as const,
          completed: true,
          points: 20,
          completedAt: now,
        },
      },
    };
    expect(resumeDemoStep(mid)).toBe('preparation');

    const david = {
      ...fresh,
      davidMission: {
        currentPhase: 'brook-skyfall' as const,
        completedPhases: ['supplies-merge' as const],
        phaseResults: {
          'supplies-merge': {
            phase: 'supplies-merge' as const,
            completed: true,
            points: 25,
            completedAt: now,
          },
        },
        phaseData: {},
        completed: false,
        completedAt: null,
      },
    };
    expect(canResumeDemo(david)).toBe(true);
    expect(resumeDemoStep(david)).toBe('david-mission');
  });
});
