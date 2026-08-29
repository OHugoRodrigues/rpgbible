'use client';

import { Backpack, CalendarCheck, Map } from 'lucide-react';
import styles from './Hud.module.css';

/**
 * HUD persistente. Mostra o que a spec trata como progresso real: pontuação da
 * missão e constância semanal — nunca tempo de tela.
 */
export function Hud({
  score,
  activeDays,
  onJourneys,
  onProfile,
  onGuide,
  guidePending = false,
}: {
  score: number;
  activeDays: number;
  onJourneys: () => void;
  onProfile: () => void;
  onGuide: () => void;
  guidePending?: boolean;
}) {
  return (
    <nav className={styles.hud} aria-label="Navegação da jornada">
      <button type="button" className={styles.hudButton} onClick={onJourneys} aria-label="Jornadas">
        <Map aria-hidden="true" />
      </button>

      <div className={styles.progress}>
        <span className={styles.progressTop}>
          <span>Missão</span>
          <span>{score}/100</span>
        </span>
        <span className={styles.progressBar}>
          <i style={{ width: `${score}%` }} />
        </span>
      </div>

      <span className={styles.week} title="Constância desta semana">
        <CalendarCheck aria-hidden="true" />
        {activeDays}/7
      </span>

      <button
        type="button"
        className={`${styles.hudButton} ${styles.guideButton}`}
        onClick={onGuide}
        data-pending={guidePending}
        aria-label="Falar com Parakletos"
      >
        <img src="/assets/characters/parakletos-guide.png" alt="" />
      </button>

      <button type="button" className={styles.hudButton} onClick={onProfile} aria-label="Estante e inventário">
        <Backpack aria-hidden="true" />
      </button>
    </nav>
  );
}
