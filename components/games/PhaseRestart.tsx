'use client';

import { useState } from 'react';
import styles from './PhaseRestart.module.css';

export interface PhaseRestartProps {
  onRestart: () => void;
  label?: string;
  confirmLabel?: string;
  requireConfirmation?: boolean;
}

export function PhaseRestart({
  onRestart,
  label = 'REINICIAR FASE',
  confirmLabel = 'CONFIRMAR REINÍCIO',
  requireConfirmation = true,
}: PhaseRestartProps) {
  const [confirming, setConfirming] = useState(false);

  if (!requireConfirmation)
    return (
      <button type="button" className={styles.restart} onClick={onRestart}>
        {label}
      </button>
    );

  if (!confirming)
    return (
      <button
        type="button"
        className={styles.restart}
        onClick={() => setConfirming(true)}
      >
        {label}
      </button>
    );

  return (
    <span className={styles.confirmGroup}>
      <button
        type="button"
        className={styles.confirm}
        onClick={() => {
          setConfirming(false);
          onRestart();
        }}
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        className={styles.cancel}
        onClick={() => setConfirming(false)}
      >
        Cancelar
      </button>
    </span>
  );
}
