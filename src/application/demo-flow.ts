import type {
  AdaptiveJourneyStageId,
  ChapterId,
  DavidPhaseId,
  DemoState,
  DemoStep,
  ExperienceMode,
  PersonalizationProfile,
} from '@/src/domain/types';

export const CHAPTER_STAGE: Record<ChapterId, AdaptiveJourneyStageId> = {
  escolhido: 'chosen',
  pastor: 'shepherd',
  provacao: 'trial',
  rei: 'king',
  legado: 'legacy',
};

/** Perfil usado quando a calibração foi pulada — tom geral, não teen. */
export const GENERIC_PARAKLETOS_PROFILE: PersonalizationProfile = {
  audienceTone: 'general',
  biblicalLiteracy: 'developing',
  experienceMode: 'balanced',
  narrativePreference: 'adventure',
};

export function experienceModeOf(
  state: Pick<DemoState, 'personalization'>,
): ExperienceMode {
  return state.personalization?.profile.experienceMode ?? 'balanced';
}

export function usesTrialMinigame(mode: ExperienceMode): boolean {
  return mode === 'gamified' || mode === 'balanced';
}

export function skipsArDuel(mode: ExperienceMode): boolean {
  return mode === 'textual';
}

export function parakletosStageFor(
  step: DemoStep,
  calibrating: boolean,
  davidPhase?: DavidPhaseId,
): AdaptiveJourneyStageId {
  if (calibrating) return 'chosen';
  if (step === 'david-mission' && davidPhase) return 'trial';
  switch (step) {
    case 'home':
    case 'pilgrim':
    case 'journeys':
    case 'chapters':
      return 'chosen';
    case 'profile':
      return 'legacy';
    default:
      return 'trial';
  }
}

export function stepAfterPreparation(mode: ExperienceMode): DemoStep {
  if (usesTrialMinigame(mode)) return 'minigame';
  if (skipsArDuel(mode)) return 'quiz';
  return 'ar';
}

export function stepAfterMinigame(mode: ExperienceMode): DemoStep {
  return skipsArDuel(mode) ? 'quiz' : 'ar';
}

export function canResumeDemo(state: DemoState): boolean {
  return (
    state.missionCompleted ||
    state.davidMission != null ||
    state.personalization !== null ||
    Object.keys(state.stageResults).length > 0
  );
}

export function resumeDemoStep(state: DemoState): DemoStep {
  if (state.missionCompleted) return 'chapters';
  if (state.davidMission) return 'david-mission';
  if (state.currentStep !== 'home') return state.currentStep;

  if (state.stageResults.quiz?.completed) return 'result';
  if (state.stageResults.ar?.completed) return 'quiz';

  const mode = experienceModeOf(state);
  const trial = state.minigameProgress.sessions.trial;
  if (trial?.status === 'completed') return stepAfterMinigame(mode);
  if (trial) return 'minigame';
  if (state.stageResults.preparation?.completed)
    return stepAfterPreparation(mode);
  if (state.stageResults.discovery?.completed) return 'preparation';
  if (state.personalization) return 'journeys';
  return 'pilgrim';
}
