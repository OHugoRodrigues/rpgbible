import {
  createJourneyPersonalization,
  getPersonalizedDavidStages,
  getStoryRecommendations,
} from '@/src/application/personalization-engine';
import type { OnboardingAnswers } from '@/src/domain/types';
import { describe, expect, it } from 'vitest';

const baseAnswers: OnboardingAnswers = {
  ageBand: '10-13',
  christianHome: 'yes',
  christianIdentity: 'exploring',
  readingAffinity: 'sometimes',
  narrativePreference: 'adventure',
};

describe('journey personalization', () => {
  it('derives a five-stage balanced journey and curated recommendations', () => {
    const personalization = createJourneyPersonalization(
      baseAnswers,
      '2026-08-29T12:00:00.000Z',
    );
    const stages = getPersonalizedDavidStages(personalization);

    expect(personalization.profile).toEqual({
      audienceTone: 'preteen',
      biblicalLiteracy: 'developing',
      experienceMode: 'balanced',
      narrativePreference: 'adventure',
    });
    expect(stages).toHaveLength(5);
    expect(
      stages.every((stage) => stage.selectedVariant.mode === 'balanced'),
    ).toBe(true);
    expect(
      getStoryRecommendations('adventure').map((story) => story.id),
    ).toEqual(['exodus', 'paul-voyage', 'joshua']);
  });

  it('does not retain the raw faith answers in the persisted personalization', () => {
    const serialized = JSON.stringify(
      createJourneyPersonalization(baseAnswers),
    );
    expect(serialized).not.toContain('christianHome');
    expect(serialized).not.toContain('christianIdentity');
    expect(serialized).not.toContain('exploring');
  });

  it.each([
    ['yes', 'textual'],
    ['sometimes', 'balanced'],
    ['no', 'gamified'],
  ] as const)('maps reading affinity %s to %s', (readingAffinity, expected) => {
    const personalization = createJourneyPersonalization({
      ...baseAnswers,
      readingAffinity,
    });
    expect(personalization.profile.experienceMode).toBe(expected);
  });
});
