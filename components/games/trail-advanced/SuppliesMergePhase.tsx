'use client';

import { useCallback, useRef, useState } from 'react';
import {
  combineMergeSlots,
  countResource,
  createMergeState,
  hasWonMerge,
  MERGE_WIN_TARGET,
  retryMergeState,
  spawnMergeResource,
  type DavidResource,
  type MergeSlot,
  type MergeState,
} from '@/src/games/david';
import { PHASE_STARTING_LIVES } from '@/src/games/david/lives-engine';
import { PhaseLives } from '../PhaseLives';
import { PhaseRestart } from '../PhaseRestart';
import styles from './SuppliesMergePhase.module.css';

export interface SuppliesMergeProgress {
  bakedBread: number;
  thickCheese: number;
  moves: number;
  lives: number;
  status: MergeState['status'];
  board: readonly MergeSlot[];
}

export interface SuppliesMergePhaseProps {
  onComplete: (progress: SuppliesMergeProgress) => void;
  onProgress?: (progress: SuppliesMergeProgress) => void;
  initialProgress?: unknown;
}

const GOAL = MERGE_WIN_TARGET;
const START_MESSAGE = `Combine os ingredientes para preparar ${GOAL} pães e ${GOAL} queijos.`;
const LABELS: Record<DavidResource, string> = {
  wheat: 'Trigo',
  'roasted-grains': 'Grãos',
  'raw-dough': 'Massa',
  'baked-bread': 'Pão',
  milk: 'Leite',
  curd: 'Coalhada',
  'thick-cheese': 'Queijo',
};
const ICONS: Record<DavidResource, string> = {
  wheat: '🌾',
  'roasted-grains': '⚱️',
  'raw-dough': '🥣',
  'baked-bread': '🍞',
  milk: '🥛',
  curd: '🫙',
  'thick-cheese': '🧀',
};

const RESOURCES = new Set<DavidResource>(
  Object.keys(LABELS) as DavidResource[],
);

function startingResources(): DavidResource[] {
  return Array.from({ length: 25 }, (_, index) =>
    index % 2 === 0 ? 'wheat' : 'milk',
  );
}

function savedLives(saved?: unknown): number {
  if (!saved || typeof saved !== 'object' || !('lives' in saved))
    return PHASE_STARTING_LIVES;
  const lives = Number(saved.lives);
  return Number.isInteger(lives)
    ? Math.min(PHASE_STARTING_LIVES, Math.max(0, lives))
    : PHASE_STARTING_LIVES;
}

function savedCollected(saved: object, key: string, fallback: number): number {
  if (!(key in saved)) return fallback;
  const value = Number((saved as Record<string, unknown>)[key]);
  return Number.isInteger(value)
    ? Math.min(GOAL, Math.max(0, value))
    : fallback;
}

function initialBoard(saved?: unknown): MergeState {
  if (
    saved &&
    typeof saved === 'object' &&
    'board' in saved &&
    Array.isArray(saved.board) &&
    saved.board.length === 25 &&
    saved.board.every(
      (slot) => slot === null || RESOURCES.has(slot as DavidResource),
    )
  ) {
    const board = saved.board as MergeSlot[];
    const lives = savedLives(saved);
    const breadOnBoard = countResource(board, 'baked-bread');
    const cheeseOnBoard = countResource(board, 'thick-cheese');
    const collectedBread = savedCollected(saved, 'bakedBread', breadOnBoard);
    const collectedCheese = savedCollected(
      saved,
      'thickCheese',
      cheeseOnBoard,
    );
    const cleaned = board.map((slot) =>
      slot === 'baked-bread' || slot === 'thick-cheese' ? null : slot,
    );
    return {
      board: cleaned,
      lives,
      collectedBread,
      collectedCheese,
      status: hasWonMerge(collectedBread, collectedCheese)
        ? 'won'
        : lives === 0
          ? 'lost'
          : 'playing',
    };
  }
  return createMergeState(25, startingResources());
}

function savedMoves(saved?: unknown): number {
  if (!saved || typeof saved !== 'object' || !('moves' in saved)) return 0;
  const moves = Number(saved.moves);
  return Number.isInteger(moves) && moves >= 0 ? moves : 0;
}

export function SuppliesMergePhase({
  onComplete,
  onProgress,
  initialProgress,
}: SuppliesMergePhaseProps) {
  const [mergeState, setMergeState] = useState<MergeState>(() =>
    initialBoard(initialProgress),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(() => savedMoves(initialProgress));
  const [message, setMessage] = useState(START_MESSAGE);
  const [done, setDone] = useState(
    () => initialBoard(initialProgress).status === 'won',
  );
  const dragRef = useRef<{ source: number; x: number; y: number } | null>(null);
  const totals = {
    bakedBread: mergeState.collectedBread,
    thickCheese: mergeState.collectedCheese,
    moves,
    lives: mergeState.lives,
    status: mergeState.status,
    board: mergeState.board,
  };

  const merge = useCallback(
    (source: number, destination: number) => {
      if (mergeState.status !== 'playing') return;
      const merged = combineMergeSlots(mergeState, source, destination);
      if (!merged.combined) {
        setMergeState(merged.state);
        setSelected(null);
        const progress = {
          bakedBread: merged.state.collectedBread,
          thickCheese: merged.state.collectedCheese,
          moves,
          lives: merged.state.lives,
          status: merged.state.status,
          board: merged.state.board,
        };
        onProgress?.(progress);
        setMessage(
          merged.state.status === 'lost'
            ? 'Você ficou sem vidas!'
            : 'Receita inválida. Você perdeu uma vida.',
        );
        return;
      }

      const next = spawnMergeResource(merged.state, Math.random);
      const progress = {
        bakedBread: next.collectedBread,
        thickCheese: next.collectedCheese,
        moves: moves + 1,
        lives: next.lives,
        status: next.status,
        board: next.board,
      };
      setMergeState(next);
      setMoves(progress.moves);
      setSelected(null);
      setMessage(
        merged.result === 'baked-bread' || merged.result === 'thick-cheese'
          ? `${LABELS[merged.result]} recolhido para a cesta.`
          : `Criado: ${LABELS[merged.result!]}.`,
      );
      onProgress?.(progress);
      if (next.status === 'won') {
        setDone(true);
        setMessage('Suprimentos preparados!');
      }
    },
    [mergeState, moves, onProgress],
  );

  const act = useCallback(
    (destination: number) => {
      if (mergeState.status !== 'playing') return;
      if (selected === null) {
        if (mergeState.board[destination]) {
          setSelected(destination);
          setMessage(
            `${LABELS[mergeState.board[destination]]} selecionado. Escolha o destino.`,
          );
        }
        return;
      }
      if (selected === destination) {
        setSelected(null);
        setMessage('Seleção cancelada.');
        return;
      }
      merge(selected, destination);
    },
    [merge, mergeState, selected],
  );

  function deliverRoastedGrains() {
    if (selected === null || mergeState.board[selected] !== 'roasted-grains')
      return;
    const board = [...mergeState.board];
    board[selected] = null;
    const next = spawnMergeResource(
      { ...mergeState, board, status: 'playing' },
      Math.random,
    );
    setMergeState(next);
    setSelected(null);
    setMessage('Grãos torrados entregues. Um novo ingrediente chegou.');
    onProgress?.({
      bakedBread: next.collectedBread,
      thickCheese: next.collectedCheese,
      moves,
      lives: next.lives,
      status: next.status,
      board: next.board,
    });
  }

  function retryPhase() {
    const next = retryMergeState(mergeState, startingResources());
    dragRef.current = null;
    setMergeState(next);
    setSelected(null);
    setMoves(0);
    setDone(false);
    setMessage(START_MESSAGE);
    onProgress?.({
      bakedBread: 0,
      thickCheese: 0,
      moves: 0,
      lives: next.lives,
      status: next.status,
      board: next.board,
    });
  }

  function handleKey(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const row = Math.floor(index / 5);
    const column = index % 5;
    const target =
      event.key === 'ArrowLeft'
        ? row * 5 + Math.max(0, column - 1)
        : event.key === 'ArrowRight'
          ? row * 5 + Math.min(4, column + 1)
          : event.key === 'ArrowUp'
            ? Math.max(0, row - 1) * 5 + column
            : event.key === 'ArrowDown'
              ? Math.min(4, row + 1) * 5 + column
              : null;
    if (target !== null) {
      event.preventDefault();
      document.getElementById(`supply-cell-${target}`)?.focus();
    }
  }

  return (
    <section className={styles.phase} aria-labelledby="supplies-title">
      <header>
        <span className={styles.eyebrow}>FASE 1</span>
        <h2 id="supplies-title">A Fornalha e o Queijo</h2>
        <p>
          Arraste e combine ingredientes básicos no tabuleiro para fabricar os
          suprimentos exatos da missão!
        </p>
      </header>
      <p className={styles.recipes}>
        Trigo + Trigo = Grãos torrados · Leite + Leite = Coalhada · Coalhada +
        Coalhada = Queijo · Trigo + Leite = Massa · Massa + Massa = Pão
      </p>
      <div className={styles.goals} aria-label="Progresso dos suprimentos">
        <span className={totals.bakedBread >= GOAL ? styles.ready : ''}>
          🍞 {totals.bakedBread}/{GOAL}
        </span>
        <span className={totals.thickCheese >= GOAL ? styles.ready : ''}>
          🧀 {totals.thickCheese}/{GOAL}
        </span>
        <span>Movimentos {moves}</span>
        <PhaseLives lives={mergeState.lives} />
      </div>
      <div
        className={styles.board}
        role="grid"
        aria-label="Tabuleiro de recursos, cinco por cinco"
        onPointerDown={(event) => {
          if (mergeState.status !== 'playing') return;
          const cell = (event.target as HTMLElement).closest<HTMLButtonElement>(
            '[data-cell-index]',
          );
          if (!cell) return;
          const source = Number(cell.dataset.cellIndex);
          if (!mergeState.board[source]) return;
          dragRef.current = {
            source,
            x: event.clientX,
            y: event.clientY,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          dragRef.current = null;
          if (!drag) return;
          const target = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLButtonElement>('[data-cell-index]');
          const destination = Number(target?.dataset.cellIndex);
          const moved = Math.hypot(
            event.clientX - drag.x,
            event.clientY - drag.y,
          );
          if (
            moved > 12 &&
            Number.isInteger(destination) &&
            destination !== drag.source
          )
            merge(drag.source, destination);
          else act(drag.source);
        }}
      >
        {mergeState.board.map((cell, index) => (
          <button
            id={`supply-cell-${index}`}
            key={index}
            type="button"
            role="gridcell"
            className={`${styles.cell} ${selected === index ? styles.selected : ''}`}
            data-resource={cell ?? 'empty'}
            data-cell-index={index}
            aria-label={
              cell
                ? `${LABELS[cell]}, posição ${index + 1}`
                : `Espaço vazio, posição ${index + 1}`
            }
            aria-selected={selected === index}
            onKeyDown={(event) => {
              handleKey(event, index);
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                act(index);
              }
            }}
          >
            {cell ? (
              <>
                <b aria-hidden="true">{ICONS[cell]}</b>
                <small>{LABELS[cell]}</small>
              </>
            ) : null}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={deliverRoastedGrains}
          disabled={
            selected === null ||
            mergeState.board[selected] !== 'roasted-grains' ||
            mergeState.status !== 'playing'
          }
        >
          Entregar grãos torrados
        </button>
        {done ? (
          <button type="button" onClick={() => onComplete(totals)}>
            Pegar os alimentos e partir
          </button>
        ) : null}
        {mergeState.status === 'lost' ? (
          <button type="button" onClick={retryPhase}>
            REPETIR FASE
          </button>
        ) : (
          <PhaseRestart onRestart={retryPhase} />
        )}
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
