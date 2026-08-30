'use client';

import { AssetPlaceholder } from '@/components/dialogue/AssetPlaceholder';
import { RpgDialogue } from '@/components/dialogue/RpgDialogue';
import { PhaseLives } from '@/components/games/PhaseLives';
import { PhaseRestart } from '@/components/games/PhaseRestart';
import { SceneStage } from '@/components/scene/SceneStage';
import {
  createStrengthState,
  retryStrength,
  stopStrength,
  tickStrength,
  type StrengthState,
} from '@/src/games/david/strength-engine';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './DavidGoliathPhase.module.css';

type StoryScene = 'camp' | 'saul' | 'confrontation';

interface StoryBeat {
  scene: StoryScene;
  speaker: 'Parakletos' | 'Golias' | 'Saul';
  text: string;
}

const STORY: readonly StoryBeat[] = [
  {
    scene: 'camp',
    speaker: 'Parakletos',
    text: 'Agora você entende por que os soldados estavam assustados.',
  },
  {
    scene: 'camp',
    speaker: 'Golias',
    text: 'Escolham um homem! Se ele me derrotar, seremos seus servos; se eu vencer, vocês nos servirão!',
  },
  {
    scene: 'camp',
    speaker: 'Parakletos',
    text: 'Golias repetiu o desafio por quarenta dias. Desta vez, Davi o enfrentaria.',
  },
  {
    scene: 'saul',
    speaker: 'Saul',
    text: 'Você não pode lutar contra esse filisteu. Você ainda é jovem, e ele é guerreiro desde a juventude.',
  },
  {
    scene: 'saul',
    speaker: 'Saul',
    text: 'Então vá. E que o Senhor esteja com você.',
  },
  {
    scene: 'saul',
    speaker: 'Parakletos',
    text: 'Davi deixou a armadura pesada e escolheu sua funda.',
  },
  {
    scene: 'confrontation',
    speaker: 'Golias',
    text: 'Sou algum cão? Vou dar sua carne às aves do céu!',
  },
  {
    scene: 'confrontation',
    speaker: 'Parakletos',
    text: 'Golias confiava na força. Davi confiava no Senhor.',
  },
];

export interface DavidGoliathProgress {
  storyIndex: number;
  livesRemaining: number;
  attempts: number;
  meterPosition: number;
  status: 'story' | 'playing' | 'lost' | 'won';
}

export interface DavidGoliathPhaseProps {
  onComplete: (progress: DavidGoliathProgress) => void;
  onProgress?: (progress: DavidGoliathProgress) => void;
  initialProgress?: unknown;
}

function restoreProgress(saved?: unknown): {
  storyIndex: number;
  strength: StrengthState;
  mode: DavidGoliathProgress['status'];
} {
  if (!saved || typeof saved !== 'object')
    return { storyIndex: 0, strength: createStrengthState(), mode: 'story' };
  const value = saved as Record<string, unknown>;
  const storyIndex = Math.min(
    STORY.length,
    Math.max(0, Math.trunc(Number(value.storyIndex) || 0)),
  );
  const savedLives = Number(value.livesRemaining);
  const lives = Math.min(
    3,
    Math.max(
      0,
      Number.isFinite(savedLives) ? Math.trunc(savedLives) : 3,
    ),
  );
  const strength = {
    ...createStrengthState(lives),
    attempts: Math.max(0, Math.trunc(Number(value.attempts) || 0)),
    position: Math.min(100, Math.max(0, Number(value.meterPosition) || 0)),
  };
  const status =
    value.status === 'won'
      ? 'won'
      : lives === 0
        ? 'lost'
        : storyIndex >= STORY.length
          ? 'playing'
          : 'story';
  return {
    storyIndex,
    strength: {
      ...strength,
      status: status === 'lost' ? 'lost' : status === 'won' ? 'won' : 'playing',
    },
    mode: status,
  };
}

export function DavidGoliathPhase({
  onComplete,
  onProgress,
  initialProgress,
}: DavidGoliathPhaseProps) {
  const [initial] = useState(() => restoreProgress(initialProgress));
  const [storyIndex, setStoryIndex] = useState(initial.storyIndex);
  const [strength, setStrength] = useState(initial.strength);
  const [mode, setMode] = useState(initial.mode);
  const [message, setMessage] = useState(
    initial.mode === 'playing'
      ? 'Toque quando o indicador estiver no centro!'
      : '',
  );
  const frameRef = useRef(0);
  const lastRef = useRef(0);

  const emit = useCallback(
    (
      nextStory: number,
      nextStrength: StrengthState,
      nextMode: DavidGoliathProgress['status'],
    ) => {
      const progress: DavidGoliathProgress = {
        storyIndex: nextStory,
        livesRemaining: nextStrength.lives,
        attempts: nextStrength.attempts,
        meterPosition: Math.round(nextStrength.position),
        status: nextMode,
      };
      onProgress?.(progress);
      return progress;
    },
    [onProgress],
  );

  useEffect(() => {
    if (mode !== 'playing') return;
    const frame = (time: number) => {
      const delta = Math.min(time - (lastRef.current || time), 50);
      lastRef.current = time;
      setStrength((current) => tickStrength(current, delta));
      frameRef.current = requestAnimationFrame(frame);
    };
    frameRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameRef.current);
  }, [mode]);

  const attempt = useCallback(() => {
    if (mode !== 'playing') return;
    const result = stopStrength(strength);
    setStrength(result.state);
    if (result.hit) {
      setMode('won');
      setMessage('🎯 PERFEITO! A pedra atingiu a testa de Golias.');
      emit(storyIndex, result.state, 'won');
      return;
    }
    const nextMode = result.state.status === 'lost' ? 'lost' : 'playing';
    setMode(nextMode);
    setMessage(
      nextMode === 'lost'
        ? 'Você ficou sem vidas!'
        : 'Fora do centro. Você perdeu uma vida.',
    );
    emit(storyIndex, result.state, nextMode);
  }, [emit, mode, storyIndex, strength]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        mode === 'playing' &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        attempt();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [attempt, mode]);

  function advanceStory() {
    const next = storyIndex + 1;
    setStoryIndex(next);
    if (next >= STORY.length) {
      setMode('playing');
      setMessage('Toque quando o indicador estiver no centro!');
      emit(next, strength, 'playing');
    } else emit(next, strength, 'story');
  }

  function previousStory() {
    if (storyIndex === 0) return;
    const previous = storyIndex - 1;
    setStoryIndex(previous);
    emit(previous, strength, 'story');
  }

  function repeatPhase() {
    const next = retryStrength();
    setStoryIndex(0);
    setStrength(next);
    setMode('story');
    setMessage('');
    emit(0, next, 'story');
  }

  if (mode === 'story') {
    const beat = STORY[storyIndex] ?? STORY[STORY.length - 1];
    return (
      <section className={styles.phase} aria-labelledby="goliath-title">
        <h2 id="goliath-title">FASE 3 — Davi e Golias</h2>
        <BattleScene scene={beat.scene} storyIndex={storyIndex} />
        <RpgDialogue
          key={storyIndex}
          speaker={beat.speaker}
          text={beat.text}
          onPrevious={storyIndex > 0 ? previousStory : undefined}
          onComplete={advanceStory}
        />
      </section>
    );
  }

  return (
    <section className={styles.phase} aria-labelledby="strength-title">
      <header className={styles.header}>
        <span>FASE 3 · O CONFRONTO</span>
        <h2 id="strength-title">Contador de força</h2>
        <PhaseLives lives={strength.lives} />
      </header>

      <div
        className={`${styles.arena} ${mode === 'won' ? styles.victory : ''}`}
      >
        <span className={styles.david} aria-label="Davi prepara a funda">
          🧑🏽‍🌾
        </span>
        <span className={styles.stone} aria-hidden="true">◆</span>
        <AssetPlaceholder asset="goliath" className={styles.goliath} />
      </div>

      <div className={styles.counter}>
        <div className={styles.scale} aria-hidden="true">
          <span>FRACO</span>
          <span>🎯</span>
          <span>FORTE</span>
        </div>
        <div
          className={styles.track}
          role="meter"
          aria-label="Contador de força"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(strength.position)}
        >
          <i className={styles.target} />
          <b style={{ left: `${strength.position}%` }} />
        </div>
        {mode === 'playing' ? (
          <button type="button" className={styles.action} onClick={attempt}>
            PARAR NO CENTRO
          </button>
        ) : null}
        {mode === 'lost' ? null : <PhaseRestart onRestart={repeatPhase} />}
        {mode === 'lost' ? (
          <div className={styles.failure} role="alert">
            <strong>Você ficou sem vidas!</strong>
            <button type="button" onClick={repeatPhase}>
              REPETIR FASE
            </button>
          </div>
        ) : null}
        {mode === 'won' ? (
          <div className={styles.success}>
            <strong>💥 GOLIAS CAI</strong>
            <button
              type="button"
              onClick={() =>
                onComplete(
                  emit(storyIndex, strength, 'won'),
                )
              }
            >
              CONTINUAR
            </button>
          </div>
        ) : null}
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

function BattleScene({
  scene,
  storyIndex,
}: {
  scene: StoryScene;
  storyIndex: number;
}) {
  const daviArmored = scene === 'saul' && storyIndex === 3;
  return (
    <SceneStage
      variant={scene === 'confrontation' ? 'valley' : 'camp'}
      className={styles.scene}
      label={
        scene === 'saul'
          ? 'Davi diante do rei Saul'
          : scene === 'camp'
            ? 'Golias desafia o exército de Israel'
            : 'Davi entra no campo de batalha'
      }
    >
      <div className={styles.cast}>
        {scene === 'saul' ? (
          <AssetPlaceholder asset="saul" className={styles.saul} />
        ) : (
          <AssetPlaceholder asset="goliath" className={styles.storyGoliath} />
        )}
        <span
          className={`${styles.storyDavid} ${daviArmored ? styles.armored : ''}`}
          aria-label={daviArmored ? 'Davi testa a armadura' : 'Davi em silêncio'}
        >
          {daviArmored ? '🛡️' : '🧑🏽‍🌾'}
        </span>
        {scene === 'camp' ? (
          <span className={styles.soldiers} aria-label="Soldados recuam">
            🛡️ 🛡️ 🛡️
          </span>
        ) : null}
      </div>
    </SceneStage>
  );
}
