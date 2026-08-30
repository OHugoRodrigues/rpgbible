import { createInitialDemoState } from '@/src/application/demo-engine';
import { createInitialDavidMissionState } from '@/src/application/david-mission-progress';
import { DAVID_PHASE_MAX_POINTS } from '@/src/domain/scoring';
import {
  DAVID_MISSION_PHASES,
  DEMO_SCHEMA_VERSION,
  type DavidMissionState,
  type DavidMissionPhaseId,
  type DemoState,
  type SerializableValue,
} from '@/src/domain/types';

export function migrateDemoState(
  persisted: unknown,
  persistedVersion: number,
  now: string,
): DemoState {
  const initial = createInitialDemoState(now);
  if (persistedVersion !== DEMO_SCHEMA_VERSION || !isRecord(persisted))
    return initial;
  const candidate = persisted as Partial<DemoState>;
  const davidMission = migrateDavidMission(candidate, now);
  const missionCompleted =
    candidate.missionCompleted === true || davidMission?.completed === true;
  const currentStep = missionCompleted
    ? 'result'
    : davidMission
      ? 'david-mission'
      : isDemoStep(candidate.currentStep)
        ? candidate.currentStep
        : initial.currentStep;
  return {
    ...initial,
    ...candidate,
    schemaVersion: DEMO_SCHEMA_VERSION,
    currentStep,
    appearance: {
      ...initial.appearance,
      ...(isRecord(candidate.appearance) ? candidate.appearance : {}),
    },
    personalization: isRecord(candidate.personalization)
      ? (candidate.personalization as DemoState['personalization'])
      : null,
    minigameProgress: isRecord(candidate.minigameProgress)
      ? (candidate.minigameProgress as DemoState['minigameProgress'])
      : initial.minigameProgress,
    davidMission,
    stageResults: isRecord(candidate.stageResults)
      ? candidate.stageResults
      : {},
    quizAnswers: isRecord(candidate.quizAnswers) ? candidate.quizAnswers : {},
    consistency: {
      ...initial.consistency,
      ...(isRecord(candidate.consistency) ? candidate.consistency : {}),
    },
    missionCompleted,
    updatedAt: now,
  } as DemoState;
}

function migrateDavidMission(
  candidate: Partial<DemoState>,
  now: string,
): DavidMissionState | null {
  const completed = candidate.missionCompleted === true;
  if (isRecord(candidate.davidMission))
    return normalizeDavidMission(candidate.davidMission, completed, now);
  return completed
    ? missionWithCompletedCount(DAVID_MISSION_PHASES.length, now)
    : null;
}

function normalizeDavidMission(
  value: Record<string, unknown>,
  forceComplete: boolean,
  now: string,
): DavidMissionState {
  const rawResults = isRecord(value.phaseResults) ? value.phaseResults : {};
  let completedCount = 0;
  for (const phase of DAVID_MISSION_PHASES) {
    if (!isRecord(rawResults[phase]) || rawResults[phase].completed !== true)
      break;
    completedCount += 1;
  }
  if (Array.isArray(value.completedPhases)) {
    let listedCount = 0;
    for (const phase of DAVID_MISSION_PHASES) {
      if (!value.completedPhases.includes(phase)) break;
      listedCount += 1;
    }
    completedCount = Math.max(completedCount, listedCount);
  }
  if (
    typeof value.currentPhase === 'string' &&
    (DAVID_MISSION_PHASES as readonly string[]).includes(value.currentPhase)
  )
    completedCount = Math.max(
      completedCount,
      DAVID_MISSION_PHASES.indexOf(value.currentPhase as DavidMissionPhaseId),
    );
  if (forceComplete || value.completed === true)
    completedCount = DAVID_MISSION_PHASES.length;

  const normalized = missionWithCompletedCount(completedCount, now);
  const rawPhaseData = isRecord(value.phaseData) ? value.phaseData : {};
  const phaseData = isRecord(value.phaseData)
    ? Object.fromEntries(
        DAVID_MISSION_PHASES.flatMap((phase) =>
          isSerializable(rawPhaseData[phase])
            ? [[phase, rawPhaseData[phase]]]
            : [],
        ),
      )
    : {};
  const phaseResults = { ...normalized.phaseResults };
  for (const phase of normalized.completedPhases) {
    const result = rawResults[phase];
    if (!isRecord(result)) continue;
    phaseResults[phase] = {
      phase,
      completed: true,
      points:
        typeof result.points === 'number' && Number.isFinite(result.points)
          ? Math.min(Math.max(result.points, 0), DAVID_PHASE_MAX_POINTS[phase])
          : DAVID_PHASE_MAX_POINTS[phase],
      completedAt:
        typeof result.completedAt === 'string' ? result.completedAt : now,
    };
  }
  return { ...normalized, phaseResults, phaseData };
}

function missionWithCompletedCount(
  count: number,
  now: string,
): DavidMissionState {
  const mission = createInitialDavidMissionState();
  const safeCount = Math.min(
    Math.max(Math.trunc(count), 0),
    DAVID_MISSION_PHASES.length,
  );
  const completedPhases = DAVID_MISSION_PHASES.slice(0, safeCount);
  const phaseResults = Object.fromEntries(
    completedPhases.map((phase) => [
      phase,
      {
        phase,
        completed: true,
        points: DAVID_PHASE_MAX_POINTS[phase],
        completedAt: now,
      },
    ]),
  ) as Partial<DavidMissionState['phaseResults']>;
  const completed = safeCount === DAVID_MISSION_PHASES.length;
  return {
    ...mission,
    currentPhase: completed
      ? DAVID_MISSION_PHASES[DAVID_MISSION_PHASES.length - 1]
      : DAVID_MISSION_PHASES[safeCount],
    completedPhases: [...completedPhases],
    phaseResults,
    completed,
    completedAt: completed ? now : null,
  };
}

function isDemoStep(value: unknown): value is DemoState['currentStep'] {
  return (
    typeof value === 'string' &&
    [
      'home',
      'pilgrim',
      'journeys',
      'chapters',
      'discovery',
      'preparation',
      'minigame',
      'ar',
      'quiz',
      'david-mission',
      'result',
      'profile',
    ].includes(value)
  );
}

function isSerializable(value: unknown): value is SerializableValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isSerializable);
  return (
    isRecord(value) &&
    Object.values(value).every((item) => isSerializable(item))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
