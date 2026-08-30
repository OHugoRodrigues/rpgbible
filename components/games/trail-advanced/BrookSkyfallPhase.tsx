'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createSkyfallGenerator,
  createSkyfallState,
  moveSkyfallPlayer,
  retrySkyfallState,
  tickSkyfall,
  type SkyfallState,
} from '@/src/games/david';
import { PHASE_STARTING_LIVES } from '@/src/games/david/lives-engine';
import { PhaseLives } from '../PhaseLives';
import { PhaseRestart } from '../PhaseRestart';
import styles from './BrookSkyfallPhase.module.css';

export interface BrookSkyfallProgress {
  stones: number;
  score: number;
  lives: number;
  playerX: number;
  speedMultiplier: number;
  status: SkyfallState['status'];
}

export interface BrookSkyfallPhaseProps {
  onComplete: (progress: BrookSkyfallProgress) => void;
  onProgress?: (progress: BrookSkyfallProgress) => void;
  initialProgress?: unknown;
}

const WIDTH = 640;
const HEIGHT = 420;
const PLAYER_Y = 360;
const SKYFALL_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  playerY: PLAYER_Y,
  playerRadius: 31,
  targetStones: 5 as const,
  stoneScore: 100,
  obstaclePenalty: 40,
  obstacleAcceleration: 0.15,
  spawnChancePerSecond: 1.7,
};

function restoreSkyfall(saved?: unknown): SkyfallState {
  const initial = createSkyfallState(SKYFALL_CONFIG);
  if (!saved || typeof saved !== 'object') return initial;
  const value = saved as Record<string, unknown>;
  const finite = (candidate: unknown, fallback: number) => {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const stones = Math.min(5, Math.max(0, Math.floor(finite(value.stones, 0))));
  const score = Math.max(0, finite(value.score, 0));
  const lives = Math.min(
    PHASE_STARTING_LIVES,
    Math.max(0, Math.floor(finite(value.lives, PHASE_STARTING_LIVES))),
  );
  const speedMultiplier = Math.max(1, finite(value.speedMultiplier, 1));
  const playerX = Math.min(
    WIDTH - SKYFALL_CONFIG.playerRadius,
    Math.max(SKYFALL_CONFIG.playerRadius, finite(value.playerX, WIDTH / 2)),
  );
  return {
    ...initial,
    player: { x: playerX },
    smoothStones: stones,
    score,
    lives,
    speedMultiplier,
    status: lives === 0 ? 'lost' : stones >= 5 ? 'won' : 'playing',
  };
}

function progressOf(game: SkyfallState): BrookSkyfallProgress {
  return {
    stones: game.smoothStones,
    score: game.score,
    lives: game.lives,
    playerX: game.player.x,
    speedMultiplier: game.speedMultiplier,
    status: game.status,
  };
}

function drawGame(context: CanvasRenderingContext2D, game: SkyfallState) {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#597b9c');
  sky.addColorStop(0.48, '#b79058');
  sky.addColorStop(0.49, '#397596');
  sky.addColorStop(1, '#174962');
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#315f38';
  context.fillRect(0, 175, 82, 245);
  context.fillRect(558, 155, 82, 265);
  context.fillStyle = '#6e7547';
  for (let y = 190; y < HEIGHT; y += 32) {
    context.fillRect(0, y, 64 + (y % 3) * 7, 12);
    context.fillRect(570 - (y % 4) * 5, y + 9, 70, 12);
  }
  context.fillStyle = '#b8e8ed55';
  for (let y = 210; y < HEIGHT; y += 28)
    context.fillRect(90 + ((y * 3) % 75), y, 390, 5);
  game.objects.forEach((item) => {
    if (item.kind === 'smooth-stone') {
      context.fillStyle = '#e8e1d2';
      context.beginPath();
      context.ellipse(item.x, item.y, 13, 10, 0, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#68798a';
      context.lineWidth = 3;
      context.stroke();
      context.fillStyle = '#fff';
      context.fillRect(item.x - 5, item.y - 5, 5, 3);
    } else if (item.obstacleShape === 'jagged-stone') {
      context.fillStyle = '#554e58';
      context.beginPath();
      context.moveTo(item.x - 18, item.y + 13);
      context.lineTo(item.x - 12, item.y - 14);
      context.lineTo(item.x - 2, item.y - 6);
      context.lineTo(item.x + 8, item.y - 17);
      context.lineTo(item.x + 19, item.y + 13);
      context.closePath();
      context.fill();
      context.strokeStyle = '#d9765c';
      context.lineWidth = 3;
      context.stroke();
    } else {
      context.fillStyle = '#603b24';
      context.save();
      context.translate(item.x, item.y);
      context.rotate(0.55);
      context.fillRect(-25, -5, 50, 10);
      context.fillRect(-12, -14, 7, 18);
      context.fillRect(8, -4, 7, 18);
      context.restore();
    }
  });
  context.fillStyle = '#5b3528';
  context.fillRect(game.player.x - 31, PLAYER_Y - 10, 62, 34);
  context.fillStyle = '#b66b36';
  context.fillRect(game.player.x - 22, PLAYER_Y - 34, 44, 27);
  context.fillStyle = '#f2d49c';
  context.fillRect(game.player.x - 11, PLAYER_Y - 55, 22, 22);
  context.fillStyle = '#1b1623';
  context.fillRect(game.player.x - 15, PLAYER_Y - 59, 30, 8);
  context.fillStyle = '#8b5534';
  context.fillRect(game.player.x + 17, PLAYER_Y - 27, 20, 25);
  context.strokeStyle = '#f0c66e';
  context.lineWidth = 3;
  context.strokeRect(game.player.x + 17, PLAYER_Y - 27, 20, 25);
  context.fillStyle = '#e5b64e';
  context.font = 'bold 16px monospace';
  context.fillText(`PEDRAS ${game.smoothStones}/5`, 18, 30);
  context.fillText(`SCORE ${game.score}`, WIDTH - 145, 30);
}

export function BrookSkyfallPhase({
  onComplete,
  onProgress,
  initialProgress,
}: BrookSkyfallPhaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialGame] = useState<SkyfallState>(() =>
    restoreSkyfall(initialProgress),
  );
  const gameRef = useRef<SkyfallState>(initialGame);
  const generatorRef = useRef(createSkyfallGenerator(Math.random));
  const directionRef = useRef<-1 | 0 | 1>(0);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const callbackRef = useRef({ onComplete, onProgress });
  const [hud, setHud] = useState<BrookSkyfallProgress>(() =>
    progressOf(initialGame),
  );
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(initialProgress !== undefined);
  const startedRef = useRef(initialProgress !== undefined);
  const settledRef = useRef(initialGame.status === 'won');
  const [message, setMessage] = useState('Recolha cinco pedras lisas.');
  const [wonProgress, setWonProgress] = useState<BrookSkyfallProgress | null>(
    () => (initialGame.status === 'won' ? progressOf(initialGame) : null),
  );

  useEffect(() => {
    callbackRef.current = { onComplete, onProgress };
  }, [onComplete, onProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(((width * HEIGHT) / WIDTH) * ratio);
      context.setTransform(
        canvas.width / WIDTH,
        0,
        0,
        canvas.height / HEIGHT,
        0,
        0,
      );
      context.imageSmoothingEnabled = false;
      drawGame(context, gameRef.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const frame = (time: number) => {
      const delta = Math.min((time - (lastRef.current || time)) / 1000, 0.05);
      lastRef.current = time;
      if (
        !document.hidden &&
        startedRef.current &&
        gameRef.current.status === 'playing'
      ) {
        const previous = gameRef.current;
        const moved = moveSkyfallPlayer(
          previous,
          directionRef.current * delta * 260,
        );
        const next = tickSkyfall(moved, delta * 1000, generatorRef.current);
        gameRef.current = next;
        const progress = progressOf(next);
        if (
          next.smoothStones !== previous.smoothStones ||
          next.score !== previous.score ||
          next.lives !== previous.lives ||
          next.speedMultiplier !== previous.speedMultiplier
        ) {
          setHud(progress);
          callbackRef.current.onProgress?.(progress);
          if (next.status === 'lost') setMessage('Você ficou sem vidas!');
        }
        drawGame(context, next);
        if (next.status === 'won' && !settledRef.current) {
          settledRef.current = true;
          setMessage('Você encontrou as 5 pedras!');
          setWonProgress(progress);
        }
      }
      frameRef.current = requestAnimationFrame(frame);
    };
    frameRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const visibility = () => {
      setPaused(document.hidden);
      lastRef.current = performance.now();
    };
    const key = (event: KeyboardEvent) => {
      if (!startedRef.current) return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a')
        directionRef.current = -1;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd')
        directionRef.current = 1;
    };
    const keyUp = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(event.key))
        directionRef.current = 0;
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', keyUp);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!startedRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const target = Math.max(
      35,
      Math.min(
        WIDTH - 35,
        ((event.clientX - bounds.left) / bounds.width) * WIDTH,
      ),
    );
    gameRef.current = moveSkyfallPlayer(
      gameRef.current,
      target - gameRef.current.player.x,
    );
  }

  function retryPhase() {
    const next = retrySkyfallState(gameRef.current);
    const progress = progressOf(next);
    gameRef.current = next;
    generatorRef.current = createSkyfallGenerator(Math.random);
    directionRef.current = 0;
    lastRef.current = performance.now();
    settledRef.current = false;
    startedRef.current = false;
    setStarted(false);
    setHud(progress);
    setWonProgress(null);
    setMessage('Recolha cinco pedras lisas.');
    callbackRef.current.onProgress?.(progress);
  }

  return (
    <section className={styles.phase} aria-labelledby="brook-title">
      <header>
        <span>FASE 2</span>
        <h2 id="brook-title">Pedras na correnteza</h2>
      </header>
      <div className={styles.hud}>
        <span>💎 {hud.stones}/5</span>
        <span>⭐ {hud.score}</span>
        <span
          className={hud.lives < PHASE_STARTING_LIVES ? styles.tornBag : ''}
          aria-label={
            hud.lives < PHASE_STARTING_LIVES
              ? 'Bolsa de couro rasgada'
              : 'Bolsa de couro intacta'
          }
        >
          🎒
        </span>
        <PhaseLives lives={hud.lives} />
      </div>
      <div className={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Davi no riacho recolhendo pedras e desviando de galhos"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            point(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              point(event);
          }}
        />
        {!started && hud.status === 'playing' ? (
          <div className={styles.instructions}>
            <strong>BUSQUE AS 5 PEDRAS LISAS</strong>
            <p>Arraste Davi ou use ← → para mover a bolsa.</p>
            <div className={styles.legend}>
              <span>⚪ Pedra lisa: colete</span>
              <span>🔺 Pedra pontuda: desvie</span>
              <span>🪵 Galho: desvie</span>
            </div>
            <small>
              Objetos perigosos tiram uma vida e aceleram a correnteza.
            </small>
            <button
              type="button"
              onClick={() => {
                startedRef.current = true;
                lastRef.current = performance.now();
                setStarted(true);
                setMessage('Colete somente as pedras lisas e redondas.');
              }}
            >
              COMEÇAR
            </button>
          </div>
        ) : null}
        {paused ? <div className={styles.pause}>PAUSADO</div> : null}
        {wonProgress ? (
          <div className={styles.finish}>
            <strong>5 PEDRAS LISAS</strong>
            <span>Você encontrou as 5 pedras!</span>
            <button type="button" onClick={() => onComplete(wonProgress)}>
              Guardar pedras
            </button>
          </div>
        ) : null}
        {hud.status === 'lost' ? (
          <div className={styles.finish}>
            <strong>Você ficou sem vidas!</strong>
            <button type="button" onClick={retryPhase}>
              REPETIR FASE
            </button>
          </div>
        ) : null}
      </div>
      <div className={styles.controls} aria-label="Controles de movimento">
        <button
          type="button"
          disabled={hud.status !== 'playing'}
          onPointerDown={() => {
            directionRef.current = -1;
          }}
          onPointerUp={() => {
            directionRef.current = 0;
          }}
        >
          ◀ Esquerda
        </button>
        <button
          type="button"
          disabled={hud.status !== 'playing'}
          onPointerDown={() => {
            directionRef.current = 1;
          }}
          onPointerUp={() => {
            directionRef.current = 0;
          }}
        >
          Direita ▶
        </button>
        <PhaseRestart onRestart={retryPhase} />
      </div>
      <p role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
