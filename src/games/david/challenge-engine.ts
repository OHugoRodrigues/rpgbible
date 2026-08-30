import { PHASE_STARTING_LIVES } from './lives-engine';

export const CHALLENGE_QUESTIONS = [
  'mission',
  'days',
  'courage',
  'story-order',
] as const;

export type ChallengeQuestionId = (typeof CHALLENGE_QUESTIONS)[number];
export type StoryCardId = 'jesse' | 'supplies' | 'brook' | 'goliath';
export type ChallengeAnswer = string | readonly string[];

export const MISSION_ANSWER = ['food', 'news'] as const;
export const STORY_ANSWER: readonly StoryCardId[] = [
  'jesse',
  'supplies',
  'brook',
  'goliath',
];

export interface ChallengeState {
  questionIndex: number;
  lives: number;
  status: 'playing' | 'lost' | 'won';
}

export interface ChallengeResult {
  state: ChallengeState;
  correct: boolean;
}

export function createChallengeState(
  lives: number = PHASE_STARTING_LIVES,
): ChallengeState {
  const safeLives = Math.min(
    PHASE_STARTING_LIVES,
    Math.max(0, Math.trunc(lives)),
  );
  return {
    questionIndex: 0,
    lives: safeLives,
    status: safeLives === 0 ? 'lost' : 'playing',
  };
}

export function challengeQuestion(
  state: ChallengeState,
): ChallengeQuestionId {
  return (
    CHALLENGE_QUESTIONS[state.questionIndex] ??
    CHALLENGE_QUESTIONS[CHALLENGE_QUESTIONS.length - 1]
  );
}

export function submitChallengeAnswer(
  state: ChallengeState,
  answer: ChallengeAnswer,
): ChallengeResult {
  if (state.status !== 'playing') return { state, correct: false };
  const correct = isCorrectAnswer(challengeQuestion(state), answer);
  if (!correct) {
    const lives = Math.max(0, state.lives - 1);
    return {
      correct: false,
      state: {
        ...state,
        lives,
        status: lives === 0 ? 'lost' : 'playing',
      },
    };
  }

  const isLast = state.questionIndex === CHALLENGE_QUESTIONS.length - 1;
  return {
    correct: true,
    state: {
      ...state,
      questionIndex: isLast ? state.questionIndex : state.questionIndex + 1,
      status: isLast ? 'won' : 'playing',
    },
  };
}

export function retryChallenge(): ChallengeState {
  return createChallengeState();
}

export function isCorrectAnswer(
  question: ChallengeQuestionId,
  answer: ChallengeAnswer,
): boolean {
  switch (question) {
    case 'mission':
      return sameMembers(answer, MISSION_ANSWER);
    case 'days':
      return answer === '40';
    case 'courage':
      return answer === 'trust-god';
    case 'story-order':
      return sameOrder(answer, STORY_ANSWER);
  }
}

function sameMembers(
  answer: ChallengeAnswer,
  expected: readonly string[],
): boolean {
  if (!Array.isArray(answer) || answer.length !== expected.length) return false;
  return expected.every((item) => answer.includes(item));
}

function sameOrder(
  answer: ChallengeAnswer,
  expected: readonly string[],
): boolean {
  if (!Array.isArray(answer) || answer.length !== expected.length) return false;
  return expected.every((item, index) => answer[index] === item);
}
