'use client';

import { useEffect, useState } from 'react';
import styles from './RpgDialogue.module.css';

export interface RpgDialogueProps {
  speaker: string;
  text: string;
  onComplete: () => void;
  onPrevious?: () => void;
  className?: string;
  characterDelay?: number;
}

export function RpgDialogue({
  speaker,
  text,
  onComplete,
  onPrevious,
  className,
  characterDelay = 28,
}: RpgDialogueProps) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisibleCharacters(reducedMotion ? text.length : 0),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, text]);

  useEffect(() => {
    if (reducedMotion || visibleCharacters >= text.length) return;
    const timer = window.setTimeout(
      () => setVisibleCharacters((current) => Math.min(current + 1, text.length)),
      characterDelay,
    );
    return () => window.clearTimeout(timer);
  }, [characterDelay, reducedMotion, text.length, visibleCharacters]);

  const typing = visibleCharacters < text.length;

  function advance() {
    if (typing) {
      setVisibleCharacters(text.length);
      return;
    }
    onComplete();
  }

  return (
    <section
      className={[styles.dialogue, className].filter(Boolean).join(' ')}
      aria-label={`Diálogo de ${speaker}`}
    >
      <strong className={styles.speaker}>{speaker}</strong>
      <button
        type="button"
        className={styles.advance}
        onClick={advance}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            advance();
          }
        }}
        aria-label={typing ? 'Mostrar todo o diálogo' : 'Avançar diálogo'}
      >
        <span className={styles.text} aria-hidden="true">
          {text.slice(0, visibleCharacters)}
          {typing ? <span className={styles.cursor}>▌</span> : null}
        </span>
        <span className={styles.srOnly} aria-live="polite">
          {typing ? '' : text}
        </span>
        <span className={styles.hint}>
          {typing ? 'Clique para revelar' : 'Use as setas para navegar'}
        </span>
      </button>
      <nav className={styles.navigation} aria-label="Navegação do diálogo">
        <button
          type="button"
          className={styles.arrow}
          disabled={!onPrevious}
          onClick={onPrevious}
          aria-label="Voltar fala"
        >
          ←
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={advance}
          aria-label={typing ? 'Mostrar toda a fala' : 'Avançar fala'}
        >
          →
        </button>
      </nav>
    </section>
  );
}
