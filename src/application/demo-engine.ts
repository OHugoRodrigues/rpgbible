import { QUIZ_QUESTIONS } from '@/src/content/pilot';
import { createJourneyPersonalization } from '@/src/application/personalization-engine';
import { createInitialMinigameProgress } from '@/src/application/minigame-progress';
import {
  completeDavidMissionPhase,
  createInitialDavidMissionState,
  updateDavidMissionPhaseData,
} from '@/src/application/david-mission-progress';
import {
  createSeededConsistency,
  deriveDavidMissionRewards,
  deriveRewards,
  registerMeaningfulSession,
} from '@/src/domain/progression';
import {
  calculateDavidMissionTotal,
  calculateMissionScore,
  STAGE_MAX_POINTS,
  tierForScore,
} from '@/src/domain/scoring';
import {
  DEMO_SCHEMA_VERSION,
  type DemoState,
  type DavidPhaseId,
  type MissionStage,
  type OnboardingAnswers,
  type PilgrimAppearance,
  type SerializableValue,
  type StageResult,
} from '@/src/domain/types';

export function createInitialDemoState(
  now = new Date().toISOString(),
): DemoState {
  const stageResults = {};
  return {
    schemaVersion: DEMO_SCHEMA_VERSION,
    appearance: { presentation: 'masculine', hair: 'short', outfit: 'sand' },
    personalization: null,
    minigameProgress: createInitialMinigameProgress(),
    davidMission: null,
    currentStep: 'home',
    stageResults,
    quizAnswers: {},
    score: calculateMissionScore(stageResults),
    rewards: [],
    consistency: createSeededConsistency(),
    missionCompleted: false,
    updatedAt: now,
  };
}

export function startDavidMission(
  state: DemoState,
  now: string,
): DemoState {
  const replaying = state.missionCompleted || state.davidMission?.completed;
  return {
    ...state,
    davidMission: replaying
      ? createInitialDavidMissionState()
      : (state.davidMission ?? createInitialDavidMissionState()),
    score: replaying ? calculateMissionScore({}) : state.score,
    missionCompleted: replaying ? false : state.missionCompleted,
    currentStep: 'david-mission',
    updatedAt: now,
  };
}

export function updateDavidPhaseData(
  state: DemoState,
  phase: DavidPhaseId,
  data: SerializableValue,
  now: string,
): DemoState {
  const mission = state.davidMission ?? createInitialDavidMissionState();
  return {
    ...state,
    davidMission: updateDavidMissionPhaseData(mission, phase, data),
    currentStep: 'david-mission',
    updatedAt: now,
  };
}

export function completeDavidPhase(
  state: DemoState,
  phase: DavidPhaseId,
  now: string,
  points?: number,
): DemoState {
  const mission = completeDavidMissionPhase(
    state.davidMission ?? createInitialDavidMissionState(),
    phase,
    now,
    points,
  );
  const nextState = {
    ...state,
    davidMission: mission,
    currentStep: 'david-mission' as const,
    updatedAt: now,
  };
  return mission.completed ? finalizeDavidMission(nextState, now) : nextState;
}

export function completeOnboarding(
  state: DemoState,
  answers: OnboardingAnswers,
  now: string,
): DemoState {
  return {
    ...state,
    personalization: createJourneyPersonalization(answers, now),
    updatedAt: now,
  };
}

export function setAppearance(
  state: DemoState,
  appearance: PilgrimAppearance,
  now: string,
): DemoState {
  return { ...state, appearance, updatedAt: now };
}

export function completeFixedStage(
  state: DemoState,
  stage: Exclude<MissionStage, 'quiz'>,
  now: string,
): DemoState {
  return withStageResult(
    state,
    {
      stage,
      completed: true,
      points: STAGE_MAX_POINTS[stage],
      completedAt: now,
    },
    now,
  );
}

export function recordArAttempt(
  state: DemoState,
  hit: boolean,
  now: string,
): DemoState {
  return hit
    ? completeFixedStage(state, 'ar', now)
    : { ...state, updatedAt: now };
}

export function answerQuiz(
  state: DemoState,
  questionId: string,
  correct: boolean,
  now: string,
): DemoState {
  if (!QUIZ_QUESTIONS.some((question) => question.id === questionId))
    throw new Error(`Unknown quiz question: ${questionId}`);
  const previous = state.quizAnswers[questionId] ?? {
    attempts: 0,
    completed: false,
    firstAttemptCorrect: false,
  };
  if (previous.completed) return state;
  const nextAnswer = {
    attempts: previous.attempts + 1,
    completed: correct,
    firstAttemptCorrect: previous.attempts === 0 && correct,
  };
  const quizAnswers = { ...state.quizAnswers, [questionId]: nextAnswer };
  const allCompleted = QUIZ_QUESTIONS.every(
    (question) => quizAnswers[question.id]?.completed,
  );
  const points = QUIZ_QUESTIONS.reduce(
    (total, question) =>
      total + (quizAnswers[question.id]?.firstAttemptCorrect ? 10 : 0),
    0,
  );
  const nextState = { ...state, quizAnswers, updatedAt: now };
  return allCompleted
    ? withStageResult(
        nextState,
        { stage: 'quiz', completed: true, points, completedAt: now },
        now,
      )
    : nextState;
}

export function canFinalizeMission(state: DemoState): boolean {
  return (
    state.davidMission?.completed === true ||
    (['discovery', 'preparation', 'ar', 'quiz'] as const).every(
      (stage) => state.stageResults[stage]?.completed,
    )
  );
}

export function finalizeMission(state: DemoState, now: string): DemoState {
  if (state.missionCompleted) return state;
  if (!canFinalizeMission(state))
    throw new Error('All mission stages must be complete before finalization.');
  if (state.davidMission?.completed) return finalizeDavidMission(state, now);
  const score = calculateMissionScore(state.stageResults);
  const consistency = registerMeaningfulSession(state.consistency);
  return {
    ...state,
    currentStep: 'result',
    score,
    consistency,
    rewards: deriveRewards(score, consistency),
    missionCompleted: true,
    updatedAt: now,
  };
}

function finalizeDavidMission(state: DemoState, now: string): DemoState {
  if (!state.davidMission?.completed)
    throw new Error('All David mission phases must be complete before finalization.');
  const score = legacyScoreForDavidTotal(
    calculateDavidMissionTotal(state.davidMission.phaseResults),
  );
  const consistency = registerMeaningfulSession(state.consistency);
  return {
    ...state,
    currentStep: 'result',
    score,
    consistency,
    rewards: deriveDavidMissionRewards(score, consistency),
    missionCompleted: true,
    updatedAt: now,
  };
}

function legacyScoreForDavidTotal(total: number): DemoState['score'] {
  const discovery = Math.min(total, STAGE_MAX_POINTS.discovery);
  const preparation = Math.min(
    Math.max(total - discovery, 0),
    STAGE_MAX_POINTS.preparation,
  );
  const ar = Math.min(
    Math.max(total - discovery - preparation, 0),
    STAGE_MAX_POINTS.ar,
  );
  const quiz = Math.min(
    Math.max(total - discovery - preparation - ar, 0),
    STAGE_MAX_POINTS.quiz,
  );
  return {
    discovery,
    preparation,
    ar,
    quiz,
    total: discovery + preparation + ar + quiz,
    tier: tierForScore(total),
  };
}

function withStageResult(
  state: DemoState,
  result: StageResult,
  now: string,
): DemoState {
  const stageResults = { ...state.stageResults, [result.stage]: result };
  return {
    ...state,
    stageResults,
    score: calculateMissionScore(stageResults),
    updatedAt: now,
  };
}
