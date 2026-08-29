import { answerQuiz, completeFixedStage, createInitialDemoState, finalizeMission, recordArAttempt } from '@/src/application/demo-engine';
import { QUIZ_QUESTIONS } from '@/src/content/pilot';
import { describe, expect, it } from 'vitest';

const now = '2026-08-29T12:00:00.000Z';

describe('demo engine', () => {
  it('retries mistakes without blocking and only scores first-attempt answers', () => {
    let state = createInitialDemoState(now);
    state = answerQuiz(state, QUIZ_QUESTIONS[0].id, false, now);
    state = answerQuiz(state, QUIZ_QUESTIONS[0].id, true, now);
    state = answerQuiz(state, QUIZ_QUESTIONS[1].id, true, now);
    state = answerQuiz(state, QUIZ_QUESTIONS[2].id, true, now);
    expect(state.stageResults.quiz?.completed).toBe(true);
    expect(state.stageResults.quiz?.points).toBe(20);
  });

  it('moves consistency from 3/7 to 4/7 and grants both rewards', () => {
    let state = createInitialDemoState(now);
    state = completeFixedStage(state, 'discovery', now);
    state = completeFixedStage(state, 'preparation', now);
    state = recordArAttempt(state, true, now);
    for (const question of QUIZ_QUESTIONS) state = answerQuiz(state, question.id, true, now);
    state = finalizeMission(state, now);
    expect(state.consistency.activeDays).toHaveLength(4);
    expect(state.consistency.goalReached).toBe(true);
    expect(state.score.total).toBe(100);
    expect(state.rewards.map((reward) => reward.id)).toEqual(['stone-of-david', 'shield-of-faith']);
  });

  it('rejects premature finalization', () => {
    expect(() => finalizeMission(createInitialDemoState(now), now)).toThrow(/must be complete/);
  });
});
