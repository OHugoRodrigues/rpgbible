import { DAVID_PHASE_MAX_POINTS } from '@/src/domain/scoring';
import {
  DAVID_MISSION_PHASES,
  type DavidMissionState,
  type DavidPhaseId,
  type DavidMissionPhaseId,
  type SerializableValue,
} from '@/src/domain/types';

export function createInitialDavidMissionState(): DavidMissionState {
  return {
    currentPhase: DAVID_MISSION_PHASES[0],
    completedPhases: [],
    phaseResults: {},
    phaseData: {},
    completed: false,
    completedAt: null,
  };
}

export function updateDavidMissionPhaseData(
  mission: DavidMissionState,
  phase: DavidPhaseId,
  data: SerializableValue,
): DavidMissionState {
  assertCurrentPhase(mission, phase);
  return {
    ...mission,
    phaseData: { ...mission.phaseData, [phase]: data },
  };
}

export function completeDavidMissionPhase(
  mission: DavidMissionState,
  phase: DavidPhaseId,
  now: string,
  points?: number,
): DavidMissionState {
  if (mission.completed) return mission;
  assertCurrentPhase(mission, phase);
  if (mission.completedPhases.includes(phase)) return mission;
  const awardedPoints = points ?? DAVID_PHASE_MAX_POINTS[phase];

  const phaseResults = {
    ...mission.phaseResults,
    [phase]: {
      phase,
      completed: true,
      points: Math.min(
        Math.max(awardedPoints, 0),
        DAVID_PHASE_MAX_POINTS[phase],
      ),
      completedAt: now,
    },
  };
  const completedPhases = DAVID_MISSION_PHASES.filter(
    (candidate) => phaseResults[candidate]?.completed,
  );
  const nextPhase = DAVID_MISSION_PHASES[completedPhases.length];
  const completed = nextPhase === undefined;

  return {
    ...mission,
    currentPhase: completed ? phase : nextPhase,
    completedPhases: [...completedPhases],
    phaseResults,
    completed,
    completedAt: completed ? now : null,
  };
}

export function isDavidMissionReadyToFinalize(
  mission: DavidMissionState,
): boolean {
  return (
    mission.completed &&
    mission.completedPhases.length === DAVID_MISSION_PHASES.length &&
    DAVID_MISSION_PHASES.every(
      (phase) => mission.phaseResults[phase]?.completed,
    )
  );
}

function assertCurrentPhase(
  mission: DavidMissionState,
  phase: DavidPhaseId,
): asserts phase is DavidMissionPhaseId {
  if (mission.completed)
    throw new Error('The David mission is already complete.');
  if (mission.currentPhase !== phase)
    throw new Error(
      `Expected David phase "${mission.currentPhase}", received "${phase}".`,
    );
}
