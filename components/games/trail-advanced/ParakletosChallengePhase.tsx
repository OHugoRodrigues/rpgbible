'use client';

import { ParakletosAvatar } from '@/components/guide/ParakletosAvatar';
import { PhaseLives } from '@/components/games/PhaseLives';
import { PhaseRestart } from '@/components/games/PhaseRestart';
import {
  challengeQuestion,
  retryChallenge,
  submitChallengeAnswer,
  type ChallengeAnswer,
  type ChallengeState,
  type StoryCardId,
} from '@/src/games/david/challenge-engine';
import { useRef, useState } from 'react';
import styles from './ParakletosChallengePhase.module.css';

const MISSION_OPTIONS = [
  { id: 'food', label: 'Levar alimentos aos irmãos' },
  { id: 'news', label: 'Buscar noticias de seus irmãos' },
  { id: 'armor', label: 'Buscar uma armadura' },
  { id: 'crown', label: 'Receber uma coroa' },
] as const;

const STORY_LABELS: Record<StoryCardId, string> = {
  jesse: 'Jessé envia Davi',
  supplies: 'Davi prepara os suprimentos',
  brook: 'Davi pega as pedras no riacho',
  goliath: 'Davi enfrenta Golias',
};

const STARTING_ORDER: StoryCardId[] = [
  'brook',
  'jesse',
  'goliath',
  'supplies',
];

export interface ParakletosChallengeProgress {
  questionIndex: number;
  livesRemaining: number;
  status: ChallengeState['status'];
  selectedMission: string[];
  storyOrder: StoryCardId[];
}

export interface ParakletosChallengePhaseProps {
  onComplete: (progress: ParakletosChallengeProgress) => void;
  onProgress?: (progress: ParakletosChallengeProgress) => void;
  initialProgress?: unknown;
}

function restore(saved?: unknown): ParakletosChallengeProgress {
  if (!saved || typeof saved !== 'object')
    return {
      questionIndex: 0,
      livesRemaining: 3,
      status: 'playing',
      selectedMission: [],
      storyOrder: [...STARTING_ORDER],
    };
  const value = saved as Record<string, unknown>;
  const questionIndex = Math.min(
    3,
    Math.max(0, Math.trunc(Number(value.questionIndex) || 0)),
  );
  const savedLives = Number(value.livesRemaining);
  const livesRemaining = Math.min(
    3,
    Math.max(
      0,
      Number.isFinite(savedLives) ? Math.trunc(savedLives) : 3,
    ),
  );
  const selectedMission = Array.isArray(value.selectedMission)
    ? value.selectedMission.filter((item): item is string => typeof item === 'string')
    : [];
  const rawOrder = Array.isArray(value.storyOrder)
    ? value.storyOrder.filter((item): item is StoryCardId =>
        ['jesse', 'supplies', 'brook', 'goliath'].includes(String(item)),
      )
    : [];
  return {
    questionIndex,
    livesRemaining,
    status:
      value.status === 'won'
        ? 'won'
        : livesRemaining === 0
          ? 'lost'
          : 'playing',
    selectedMission,
    storyOrder:
      rawOrder.length === STARTING_ORDER.length
        ? rawOrder
        : [...STARTING_ORDER],
  };
}

export function ParakletosChallengePhase({
  onComplete,
  onProgress,
  initialProgress,
}: ParakletosChallengePhaseProps) {
  const [initial] = useState(() => restore(initialProgress));
  const [game, setGame] = useState<ChallengeState>({
    questionIndex: initial.questionIndex,
    lives: initial.livesRemaining,
    status: initial.status,
  });
  const [selectedMission, setSelectedMission] = useState(
    initial.selectedMission,
  );
  const [storyOrder, setStoryOrder] = useState(initial.storyOrder);
  const [feedback, setFeedback] = useState(
    initial.status === 'lost' ? 'Você ficou sem vidas!' : '',
  );
  const dragRef = useRef<number | null>(null);

  function progress(
    nextGame = game,
    nextMission = selectedMission,
    nextOrder = storyOrder,
  ): ParakletosChallengeProgress {
    return {
      questionIndex: nextGame.questionIndex,
      livesRemaining: nextGame.lives,
      status: nextGame.status,
      selectedMission: [...nextMission],
      storyOrder: [...nextOrder],
    };
  }

  function submit(answer: ChallengeAnswer) {
    const result = submitChallengeAnswer(game, answer);
    setGame(result.state);
    setFeedback(
      result.correct
        ? result.state.status === 'won'
          ? 'Desafio concluído!'
          : 'Correto! Próxima pergunta.'
        : result.state.status === 'lost'
          ? 'Você ficou sem vidas!'
          : 'Resposta incorreta. Você perdeu uma vida.',
    );
    onProgress?.(progress(result.state));
  }

  function toggleMission(id: string) {
    if (game.status !== 'playing') return;
    const next = selectedMission.includes(id)
      ? selectedMission.filter((item) => item !== id)
      : [...selectedMission, id];
    setSelectedMission(next);
    onProgress?.(progress(game, next));
  }

  function moveCard(from: number, to: number) {
    if (from === to || to < 0 || to >= storyOrder.length) return;
    const next = [...storyOrder];
    const [card] = next.splice(from, 1);
    if (!card) return;
    next.splice(to, 0, card);
    setStoryOrder(next);
    onProgress?.(progress(game, selectedMission, next));
  }

  function repeatPhase() {
    const next = retryChallenge();
    setGame(next);
    setSelectedMission([]);
    setStoryOrder([...STARTING_ORDER]);
    setFeedback('');
    onProgress?.(
      progress(next, [], [...STARTING_ORDER]),
    );
  }

  const question = challengeQuestion(game);

  return (
    <section className={styles.phase} aria-labelledby="challenge-title">
      <header className={styles.header}>
        <ParakletosAvatar className={styles.avatar} />
        <div>
          <span>FASE FINAL</span>
          <h2 id="challenge-title">Desafio do Parakletos</h2>
        </div>
        <PhaseLives lives={game.lives} />
      </header>

      {game.status === 'playing' ? (
        <div className={styles.question}>
          <span className={styles.counter}>
            Pergunta {game.questionIndex + 1} de 4
          </span>
          {question === 'mission' ? (
            <>
              <h3>O que Jessé pediu para Davi fazer?</h3>
              <p>Selecione todos os elementos relacionados à missão.</p>
              <div className={styles.optionGrid}>
                {MISSION_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={
                      selectedMission.includes(option.id)
                        ? styles.selected
                        : ''
                    }
                    aria-pressed={selectedMission.includes(option.id)}
                    onClick={() => toggleMission(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.confirm}
                onClick={() => submit(selectedMission)}
              >
                CONFIRMAR RESPOSTA
              </button>
            </>
          ) : null}

          {question === 'days' ? (
            <>
              <h3>Durante quantos dias Golias desafiou o exército de Israel?</h3>
              <div className={styles.numberGrid}>
                {['7', '20', '40', '100'].map((number) => (
                  <button type="button" key={number} onClick={() => submit(number)}>
                    {number}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {question === 'courage' ? (
            <>
              <h3>O que melhor explica a atitude de Davi diante de Golias?</h3>
              <div className={styles.choiceGrid}>
                <button type="button" onClick={() => submit('trust-god')}>
                  🛡️ Confiar em Deus mesmo diante de um grande desafio.
                </button>
                <button type="button" onClick={() => submit('stronger')}>
                  ⚔️ Enfrentar Golias porque sabia que era mais forte.
                </button>
              </div>
            </>
          ) : null}

          {question === 'story-order' ? (
            <>
              <h3>Organize a história</h3>
              <p>Arraste as cenas ou use os botões para mudar a ordem.</p>
              <ol className={styles.storyList}>
                {storyOrder.map((card, index) => (
                  <li key={card}>
                    <button
                      type="button"
                      className={styles.cardHandle}
                      draggable
                      aria-label={`${STORY_LABELS[card]}. Arraste para mudar a posição.`}
                      onDragStart={() => {
                        dragRef.current = index;
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (dragRef.current !== null)
                          moveCard(dragRef.current, index);
                        dragRef.current = null;
                      }}
                    >
                      {index + 1}. {STORY_LABELS[card]}
                    </button>
                    <span className={styles.orderButtons}>
                      <button
                        type="button"
                        aria-label={`Mover ${STORY_LABELS[card]} para cima`}
                        disabled={index === 0}
                        onClick={() => moveCard(index, index - 1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`Mover ${STORY_LABELS[card]} para baixo`}
                        disabled={index === storyOrder.length - 1}
                        onClick={() => moveCard(index, index + 1)}
                      >
                        ↓
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className={styles.confirm}
                onClick={() => submit(storyOrder)}
              >
                CONFIRMAR ORDEM
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {game.status === 'lost' ? (
        <div className={styles.failure} role="alert">
          <strong>Você ficou sem vidas!</strong>
          <button type="button" onClick={repeatPhase}>
            REPETIR FASE
          </button>
        </div>
      ) : null}

      {game.status === 'won' ? (
        <div className={styles.success}>
          <span aria-hidden="true">🏆</span>
          <strong>MISSÃO CONCLUÍDA</strong>
          <p>🦁 CONQUISTA DESBLOQUEADA</p>
          <h3>CORAGEM PARA CONFIAR</h3>
          <p>❤️ Vidas restantes: {game.lives}/3</p>
          <button type="button" onClick={() => onComplete(progress())}>
            CONTINUAR
          </button>
        </div>
      ) : null}

      {game.status === 'lost' ? null : (
        <div className={styles.restartRow}>
          <PhaseRestart onRestart={repeatPhase} />
        </div>
      )}

      <p className={styles.feedback} role="status" aria-live="polite">
        {feedback}
      </p>
    </section>
  );
}
