import { getDavidMinigame } from '@/src/content/minigames';
import type { AdaptiveJourneyStageId, DemoState } from '@/src/domain/types';
import {
  addMaterialRewards,
  beginMinigameRecovery,
  createMaterialInventory,
  resumeAfterGuidedReading,
  startMinigame,
  submitMinigameAnswer,
  submitRecoveryAnswer,
} from '@/src/games/minigame-engine';
import type { MinigameProgress, RecoveryMode } from '@/src/games/types';

export function createInitialMinigameProgress(): MinigameProgress {
  return { sessions: {}, materials: createMaterialInventory() };
}

export function startJourneyMinigame(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  now: string,
): DemoState {
  const definition = getDavidMinigame(challengeId);
  const mode = state.personalization?.profile.experienceMode ?? 'balanced';
  return updateProgress(
    state,
    {
      ...state.minigameProgress,
      sessions: {
        ...state.minigameProgress.sessions,
        [challengeId]: startMinigame(definition, mode, now),
      },
    },
    now,
  );
}

export function answerJourneyMinigame(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  answer: string,
  now: string,
): DemoState {
  const session = requireSession(state, challengeId);
  const transition = submitMinigameAnswer(
    session,
    getDavidMinigame(challengeId),
    answer,
    now,
  );
  return applyTransition(state, challengeId, transition, now);
}

export function chooseJourneyMinigameRecovery(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  mode: RecoveryMode,
  now: string,
): DemoState {
  const session = beginMinigameRecovery(
    requireSession(state, challengeId),
    mode,
    now,
  );
  return updateSession(state, challengeId, session, now);
}

export function answerJourneyRecoveryTask(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  answer: string,
  now: string,
): DemoState {
  const transition = submitRecoveryAnswer(
    requireSession(state, challengeId),
    getDavidMinigame(challengeId),
    answer,
    now,
  );
  return applyTransition(state, challengeId, transition, now);
}

export function resumeJourneyMinigame(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  now: string,
): DemoState {
  const session = resumeAfterGuidedReading(
    requireSession(state, challengeId),
    getDavidMinigame(challengeId),
    now,
  );
  return updateSession(state, challengeId, session, now);
}

function applyTransition(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  transition: ReturnType<typeof submitMinigameAnswer>,
  now: string,
): DemoState {
  const materials = addMaterialRewards(
    state.minigameProgress.materials,
    transition.rewards,
  );
  return updateProgress(
    state,
    {
      sessions: {
        ...state.minigameProgress.sessions,
        [challengeId]: transition.session,
      },
      materials,
    },
    now,
  );
}

function updateSession(
  state: DemoState,
  challengeId: AdaptiveJourneyStageId,
  session: MinigameProgress['sessions'][AdaptiveJourneyStageId],
  now: string,
): DemoState {
  return updateProgress(
    state,
    {
      ...state.minigameProgress,
      sessions: { ...state.minigameProgress.sessions, [challengeId]: session },
    },
    now,
  );
}

function updateProgress(
  state: DemoState,
  minigameProgress: MinigameProgress,
  now: string,
): DemoState {
  return { ...state, minigameProgress, updatedAt: now };
}

function requireSession(state: DemoState, challengeId: AdaptiveJourneyStageId) {
  const session = state.minigameProgress.sessions[challengeId];
  if (!session) throw new Error(`Minigame ${challengeId} has not started.`);
  return session;
}
