import { createInitialDemoState } from '@/src/application/demo-engine';
import { DEMO_SCHEMA_VERSION, type DemoState } from '@/src/domain/types';

export function migrateDemoState(
  persisted: unknown,
  persistedVersion: number,
  now: string,
): DemoState {
  const initial = createInitialDemoState(now);
  if (!isRecord(persisted) || persistedVersion > DEMO_SCHEMA_VERSION)
    return initial;
  const candidate = persisted as Partial<DemoState>;
  return {
    ...initial,
    ...candidate,
    schemaVersion: DEMO_SCHEMA_VERSION,
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
    stageResults: isRecord(candidate.stageResults)
      ? candidate.stageResults
      : {},
    quizAnswers: isRecord(candidate.quizAnswers) ? candidate.quizAnswers : {},
    consistency: {
      ...initial.consistency,
      ...(isRecord(candidate.consistency) ? candidate.consistency : {}),
    },
    updatedAt: now,
  } as DemoState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
