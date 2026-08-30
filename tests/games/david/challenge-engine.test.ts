import {
  STORY_ANSWER,
  createChallengeState,
  retryChallenge,
  submitChallengeAnswer,
} from '@/src/games/david/challenge-engine';
import { describe, expect, it } from 'vitest';

describe('Parakletos challenge engine', () => {
  it('accepts the four answers in order', () => {
    let state = createChallengeState();
    state = submitChallengeAnswer(state, ['news', 'food']).state;
    expect(state.questionIndex).toBe(1);
    state = submitChallengeAnswer(state, '40').state;
    expect(state.questionIndex).toBe(2);
    state = submitChallengeAnswer(state, 'trust-god').state;
    expect(state.questionIndex).toBe(3);
    state = submitChallengeAnswer(state, STORY_ANSWER).state;
    expect(state.status).toBe('won');
    expect(state.lives).toBe(3);
  });

  it('rejects wrong answers and loses one shared life', () => {
    let state = createChallengeState();
    state = submitChallengeAnswer(state, ['food']).state;
    expect(state.lives).toBe(2);
    state = {
      ...state,
      questionIndex: 1,
    };
    state = submitChallengeAnswer(state, '20').state;
    expect(state.lives).toBe(1);
    state = submitChallengeAnswer(state, '100').state;
    expect(state.status).toBe('lost');
  });

  it('restarts the whole challenge after defeat', () => {
    expect(retryChallenge()).toEqual(createChallengeState());
  });
});
