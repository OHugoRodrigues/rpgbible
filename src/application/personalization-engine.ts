import {
  DAVID_ADAPTIVE_STAGES,
  STORY_RECOMMENDATIONS,
} from '@/src/content/adaptive-journeys';
import { derivePersonalizationProfile } from '@/src/domain/personalization';
import type {
  AdaptiveJourneyStage,
  JourneyPersonalization,
  OnboardingAnswers,
  StoryRecommendation,
} from '@/src/domain/types';

export function createJourneyPersonalization(
  answers: OnboardingAnswers,
  now = new Date().toISOString(),
): JourneyPersonalization {
  const profile = derivePersonalizationProfile(answers);
  return {
    profile,
    recommendedStoryIds: getStoryRecommendations(
      profile.narrativePreference,
    ).map((story) => story.id),
    generatedAt: now,
  };
}

export function getStoryRecommendations(
  preference: OnboardingAnswers['narrativePreference'],
): readonly StoryRecommendation[] {
  return STORY_RECOMMENDATIONS.filter((story) => story.context === preference);
}

export function getPersonalizedDavidStages(
  personalization: JourneyPersonalization,
): Array<
  AdaptiveJourneyStage & {
    selectedVariant: AdaptiveJourneyStage['variants'][keyof AdaptiveJourneyStage['variants']];
  }
> {
  const mode = personalization.profile.experienceMode;
  return DAVID_ADAPTIVE_STAGES.map((stage) => ({
    ...stage,
    selectedVariant: stage.variants[mode],
  }));
}
