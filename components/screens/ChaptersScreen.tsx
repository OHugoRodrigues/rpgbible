'use client';

import { DiamondDivider, GoldFrame, LockBadge, Overline } from '@/components/frame';
import { DAVID_CHAPTERS } from '@/src/content/pilot';
import { CHAPTER_STAGE } from '@/src/application/demo-flow';
import { getPersonalizedDavidStages } from '@/src/application/personalization-engine';
import {
  DAVID_MISSION_PHASES,
  type ChapterId,
  type DavidMissionState,
} from '@/src/domain/types';
import { ChevronLeft } from 'lucide-react';
import styles from './Screens.module.css';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

/**
 * US05 — os cinco capítulos de Davi.
 *
 * "A Provação" é o capítulo jogável do piloto; os demais aparecem como preview
 * bloqueado, com o progresso visível na trilha.
 */
export function ChaptersScreen({
  completedChapters,
  stages,
  davidMission,
  onPlay,
  onBack,
}: {
  completedChapters: readonly ChapterId[];
  stages?: ReturnType<typeof getPersonalizedDavidStages>;
  davidMission?: DavidMissionState | null;
  onPlay: (chapter: ChapterId) => void;
  onBack: () => void;
}) {
  const playable = DAVID_CHAPTERS.filter((chapter) => chapter.playable).length;
  const trailDone = davidMission?.completedPhases.length ?? 0;
  const progress = Math.round(
    (trailDone / DAVID_MISSION_PHASES.length) * 100,
  );

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar às jornadas">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>Davi — Fé e Coragem</Overline>
          <h1>Capítulos da jornada</h1>
        </div>
      </header>

      <div className={styles.chapterProgress}>
        <span className={styles.chapterProgressBar}>
          <i style={{ width: `${progress}%` }} />
        </span>
        <span className={styles.chapterProgressLabel}>
          O Guerreiro · {trailDone}/{DAVID_MISSION_PHASES.length} fases
        </span>
      </div>

      <DiamondDivider label={`${playable} trilha jogável neste piloto`} />

      <ul className={styles.chapterList} style={{ marginTop: 'var(--space-5)' }}>
        {DAVID_CHAPTERS.map((chapter, index) => {
          const complete = completedChapters.includes(chapter.id);
          const state = complete ? 'complete' : chapter.playable ? 'playable' : 'locked';
          const variant = stages?.find((stage) => stage.id === CHAPTER_STAGE[chapter.id])?.selectedVariant;

          return (
            <li key={chapter.id}>
              <GoldFrame tight>
                <button
                  type="button"
                  className={`${styles.chapterCard} ${chapter.playable ? '' : styles.chapterCardLocked}`}
                  data-state={state}
                  disabled={!chapter.playable}
                  onClick={() => chapter.playable && onPlay(chapter.id)}
                  aria-label={
                    chapter.playable
                      ? `Capítulo ${chapter.order}: ${chapter.name}. ${complete ? 'Concluído.' : 'Jogável.'}`
                      : `Capítulo ${chapter.order}: ${chapter.name}. Em breve.`
                  }
                >
                  <span className={styles.chapterNumber}>{ROMAN[index]}</span>
                  <span className={styles.chapterText}>
                    <strong>{chapter.name}</strong>
                    <small>{chapter.summary}</small>
                    {variant ? (
                      <small className={styles.chapterVariant}>
                        {variant.title} · {variant.mechanic}
                      </small>
                    ) : null}
                  </span>
                  {chapter.playable ? (
                    <span className={styles.playableTag}>
                      {complete ? 'Concluído' : trailDone > 0 ? 'Retomar' : 'Jogar'}
                    </span>
                  ) : null}
                  {chapter.playable ? null : <LockBadge soon={false} />}
                </button>
              </GoldFrame>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
