import { PHASE_STARTING_LIVES } from '@/src/games/david/lives-engine';
import styles from './PhaseLives.module.css';

export interface PhaseLivesProps {
  lives: number;
  label?: string;
}

export function PhaseLives({ lives, label = 'Vidas' }: PhaseLivesProps) {
  const safeLives = Math.min(
    PHASE_STARTING_LIVES,
    Math.max(0, Math.floor(lives)),
  );

  return (
    <span
      className={styles.lives}
      aria-label={`${label}: ${safeLives} de ${PHASE_STARTING_LIVES}`}
    >
      <span className={styles.label}>{label}</span>
      <span aria-hidden="true">
        {'♥'.repeat(safeLives)}
        {'♡'.repeat(PHASE_STARTING_LIVES - safeLives)}
      </span>
    </span>
  );
}
