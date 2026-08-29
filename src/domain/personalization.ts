import type {
  AudienceTone,
  BiblicalLiteracy,
  ExperienceMode,
  OnboardingAnswers,
  PersonalizationProfile,
} from '@/src/domain/types';

export function derivePersonalizationProfile(
  answers: OnboardingAnswers,
): PersonalizationProfile {
  return {
    audienceTone: audienceToneFor(answers.ageBand),
    biblicalLiteracy: biblicalLiteracyFor(answers),
    experienceMode: experienceModeFor(answers.readingAffinity),
    narrativePreference: answers.narrativePreference,
  };
}

function audienceToneFor(ageBand: OnboardingAnswers['ageBand']): AudienceTone {
  if (ageBand === '6-9') return 'child';
  if (ageBand === '10-13') return 'preteen';
  if (ageBand === '14-17') return 'teen';
  return 'general';
}

function experienceModeFor(
  readingAffinity: OnboardingAnswers['readingAffinity'],
): ExperienceMode {
  if (readingAffinity === 'yes') return 'textual';
  if (readingAffinity === 'no') return 'gamified';
  return 'balanced';
}

function biblicalLiteracyFor(answers: OnboardingAnswers): BiblicalLiteracy {
  if (answers.christianHome === 'yes' && answers.christianIdentity === 'yes')
    return 'familiar';
  if (answers.christianHome === 'no' && answers.christianIdentity === 'no')
    return 'introductory';
  return 'developing';
}
