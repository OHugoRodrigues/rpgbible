'use client';

import { useState } from 'react';
import styles from './ParakletosGuide.module.css';

/** Pomba estilizada — fallback para falha no carregamento do sprite. */
export function ParakletosMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-hidden="true">
      <ellipse cx="32" cy="38" rx="14" ry="10" fill="#9cecff" opacity="0.35" />
      <path
        d="M18 36c6-10 14-16 22-14 4 8-2 16-10 20-6 2-12 0-12-6z"
        fill="#c9f4ff"
      />
      <path d="M40 24c8-2 14 4 16 12-6-2-12-4-16-8z" fill="#7ec8e3" />
      <circle cx="28" cy="30" r="2" fill="#0d2333" />
      <path d="M22 34c8 6 16 6 24 0" fill="none" stroke="#f3bd59" strokeWidth="1.5" />
    </svg>
  );
}

export function ParakletosAvatar({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <ParakletosMark className={className} />;
  return (
    <img
      className={className}
      src="/assets/characters/parakletos.png"
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

export function ParakletosHudIcon() {
  const [failed, setFailed] = useState(false);
  if (failed) return <ParakletosMark className={styles.hudMark} />;
  return (
    <img
      src="/assets/characters/parakletos.png"
      alt=""
      onError={() => setFailed(true)}
    />
  );
}
