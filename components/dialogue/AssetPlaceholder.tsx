'use client';

import { useState } from 'react';
import styles from './AssetPlaceholder.module.css';

export type PlaceholderAsset = 'dove' | 'jesse' | 'goliath' | 'saul';

const ASSETS: Record<PlaceholderAsset, { label: string; source: string }> = {
  dove: {
    label: 'Parakletos',
    source: '/assets/characters/parakletos.png',
  },
  jesse: { label: 'Jessé', source: '/assets/characters/jesse.png' },
  goliath: { label: 'Golias', source: '/assets/characters/goliath.png' },
  saul: { label: 'Rei Saul', source: '/assets/characters/saul.png' },
};

export function AssetPlaceholder({
  asset,
  className,
}: {
  asset: PlaceholderAsset;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const definition = ASSETS[asset];

  return (
    <span
      id={`asset-${asset}`}
      className={[styles.placeholder, styles[asset], className].filter(Boolean).join(' ')}
      role="img"
      aria-label={definition.label}
    >
      {failed ? (
        <svg className={styles.fallback} viewBox="0 0 96 112" aria-hidden="true">
          {asset === 'dove' ? (
            <>
              <path d="M18 60 4 34l32 14C45 22 69 18 82 30 65 33 59 41 60 51l28 9-22 9c-10 18-32 22-49 10l18-8Z" />
              <circle cx="68" cy="35" r="3" />
            </>
          ) : (
            <>
              <rect x="34" y="7" width="28" height="29" rx="4" />
              <path d="M23 103V58c0-14 11-25 25-25s25 11 25 25v45H59V78H37v25Z" />
              <path d="M23 55 7 83l11 6 20-29M73 55l16 28-11 6-20-29" />
              {asset === 'goliath' ? <path d="M27 43 17 21h62L69 43Z" /> : null}
              {asset === 'saul' ? <path d="M29 15 39 25 48 9 57 25 67 15 63 31H33Z" /> : null}
            </>
          )}
        </svg>
      ) : (
        <img
          className={styles.image}
          src={definition.source}
          alt=""
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
