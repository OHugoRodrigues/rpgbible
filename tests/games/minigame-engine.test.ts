import { getDavidMinigame } from '@/src/content/minigames';
import {
  beginMinigameRecovery,
  GUIDED_READING_COOLDOWN_MS,
  resumeAfterGuidedReading,
  startMinigame,
  submitMinigameAnswer,
  submitRecoveryAnswer,
} from '@/src/games/minigame-engine';
import { describe, expect, it } from 'vitest';

const definition = getDavidMinigame('trial');
const start = '2026-08-29T12:00:00.000Z';

describe('timed minigame engine', () => {
  it('awards a gemstone for a fast first-life answer', () => {
    const session = startMinigame(definition, 'gamified', start);
    const result = submitMinigameAnswer(
      session,
      definition,
      'FUNDA',
      '2026-08-29T12:00:05.000Z',
    );
    expect(result.correct).toBe(true);
    expect(result.session.status).toBe('completed');
    expect(result.rewards[0].material).toBe('gemstone');
    expect(result.rewards[0].score).toBeGreaterThanOrEqual(90);
  });

  it('spends lives, grants straw only once and never permanently blocks play', () => {
    let session = startMinigame(definition, 'gamified', start);
    let totalStraw = 0;
    for (let index = 1; index <= 3; index += 1) {
      const transition = submitMinigameAnswer(
        session,
        definition,
        'espada',
        `2026-08-29T12:00:0${index}.000Z`,
      );
      session = transition.session;
      totalStraw += transition.rewards.filter(
        (reward) => reward.material === 'straw',
      ).length;
    }
    expect(session.status).toBe('recovery-required');
    expect(session.livesRemaining).toBe(0);
    expect(totalStraw).toBe(1);

    session = beginMinigameRecovery(
      session,
      'context-task',
      '2026-08-29T12:01:00.000Z',
    );
    const wrongRecovery = submitRecoveryAnswer(
      session,
      definition,
      'espada',
      '2026-08-29T12:01:10.000Z',
    );
    expect(wrongRecovery.session.status).toBe('recovery-task');
    const recovered = submitRecoveryAnswer(
      wrongRecovery.session,
      definition,
      'funda',
      '2026-08-29T12:01:20.000Z',
    );
    expect(recovered.session.status).toBe('active');
    expect(recovered.session.livesRemaining).toBe(1);
    expect(recovered.rewards[0].material).toBe('grass');

    const completion = submitMinigameAnswer(
      recovered.session,
      definition,
      'funda',
      '2026-08-29T12:01:21.000Z',
    );
    expect(completion.session.status).toBe('completed');
    expect(completion.rewards[0].material).toBe('wood');
    expect(completion.rewards[0].score).toBe(59);
  });

  it('enforces the one-hour guided-reading cooldown and restores all lives', () => {
    let session = startMinigame(definition, 'gamified', start);
    for (let index = 1; index <= 3; index += 1) {
      session = submitMinigameAnswer(
        session,
        definition,
        'errado',
        `2026-08-29T12:00:0${index}.000Z`,
      ).session;
    }
    const cooldownStart = '2026-08-29T12:05:00.000Z';
    session = beginMinigameRecovery(session, 'guided-reading', cooldownStart);
    expect(() =>
      resumeAfterGuidedReading(session, definition, '2026-08-29T13:04:59.999Z'),
    ).toThrow('still active');

    const availableAt = new Date(
      Date.parse(cooldownStart) + GUIDED_READING_COOLDOWN_MS,
    ).toISOString();
    const resumed = resumeAfterGuidedReading(session, definition, availableAt);
    expect(resumed.status).toBe('active');
    expect(resumed.livesRemaining).toBe(3);
  });
});
