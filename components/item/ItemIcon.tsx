'use client';

import { useState } from 'react';
import type { RewardTier } from '@/src/domain/types';
import styles from './ItemIcon.module.css';

/**
 * Ícone de item com duas fontes.
 *
 * Tenta o PNG de pixel art indicado pelo catálogo; se o arquivo ainda não
 * existir, cai para o vetor equivalente desenhado abaixo. A arte definitiva
 * entra sem alteração de código — basta o PNG existir no caminho do catálogo.
 */
export function ItemIcon({
  itemId,
  asset,
  name,
  tier,
  locked = false,
}: {
  itemId: string;
  asset: string;
  name: string;
  tier?: RewardTier;
  locked?: boolean;
}) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const tierClass =
    tier === 'epic' ? styles.tierEpic : tier === 'rare' ? styles.tierRare : styles.tierCommon;

  return (
    <span
      className={[styles.icon, styles.glow, tierClass, locked && styles.locked]
        .filter(Boolean)
        .join(' ')}
    >
      {spriteFailed ? (
        <VectorItem itemId={itemId} title={name} />
      ) : (
        <img
          className={styles.sprite}
          src={asset}
          alt={name}
          onError={() => setSpriteFailed(true)}
        />
      )}
    </span>
  );
}

const STEEL = { light: '#e8ecef', mid: '#9fabb4', dark: '#5a666f' };
const GOLD = { light: '#ffeec0', mid: '#f3bd59', dark: '#a86a16' };
const LEATHER = { light: '#a9713c', mid: '#7d4d21', dark: '#4a2c11' };

function VectorItem({ itemId, title }: { itemId: string; title: string }) {
  return (
    <svg className={styles.vector} viewBox="0 0 64 64" role="img" aria-label={title}>
      <title>{title}</title>
      {renderShape(itemId)}
    </svg>
  );
}

function renderShape(itemId: string) {
  switch (itemId) {
    case 'scroll-of-samuel':
      return (
        <>
          <rect x="14" y="12" width="36" height="40" rx="2" fill="#f2e2c4" />
          <rect x="14" y="12" width="36" height="40" rx="2" fill="none" stroke="#b89b6d" strokeWidth="1.5" />
          <g stroke="#8a6f46" strokeWidth="2" strokeLinecap="round">
            <path d="M21 23h22M21 30h22M21 37h14" />
          </g>
          <rect x="9" y="8" width="46" height="8" rx="4" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
          <rect x="9" y="48" width="46" height="8" rx="4" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
        </>
      );
    case 'sling-of-david':
      return (
        <>
          <path d="M18 10c-4 12-3 24 6 32" fill="none" stroke={LEATHER.mid} strokeWidth="4" strokeLinecap="round" />
          <path d="M46 10c4 12 3 24-6 32" fill="none" stroke={LEATHER.mid} strokeWidth="4" strokeLinecap="round" />
          <path d="M24 42c4 6 12 6 16 0l-2-6H26z" fill={LEATHER.dark} stroke={LEATHER.light} strokeWidth="1.5" />
          <circle cx="32" cy="41" r="6" fill="#9aa1a6" stroke="#5f676c" strokeWidth="1.5" />
          <rect x="14" y="6" width="8" height="6" rx="3" fill={LEATHER.light} />
          <rect x="42" y="6" width="8" height="6" rx="3" fill={LEATHER.light} />
        </>
      );
    case 'helmet-of-salvation':
      return (
        <>
          <path d="M14 34a18 18 0 0136 0v14H14z" fill={STEEL.mid} stroke={STEEL.dark} strokeWidth="2" />
          <path d="M14 34a18 18 0 0118-18v32H14z" fill={STEEL.light} opacity=".55" />
          <path d="M30 16h4v32h-4z" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1" />
          <path d="M22 40h20v10H22z" fill="#2b3238" />
          <path d="M28 8c6-4 10 2 6 10-3-6-4-7-6-10z" fill="#c0392b" />
          <rect x="12" y="46" width="40" height="6" rx="3" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
        </>
      );
    case 'breastplate-of-righteousness':
      return (
        <>
          <path d="M16 16h32l-3 30-13 8-13-8z" fill={STEEL.mid} stroke={STEEL.dark} strokeWidth="2" />
          <path d="M16 16h16v38l-13-8z" fill={STEEL.light} opacity=".5" />
          <rect x="10" y="14" width="14" height="9" rx="4" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
          <rect x="40" y="14" width="14" height="9" rx="4" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
          <g stroke={GOLD.mid} strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M32 24v14M25 28h14M22 36c2 3 5 3 7 0M35 36c2 3 5 3 7 0" />
          </g>
        </>
      );
    case 'belt-of-truth':
      return (
        <>
          <rect x="4" y="26" width="56" height="14" rx="3" fill={LEATHER.mid} stroke={LEATHER.dark} strokeWidth="2" />
          <rect x="4" y="29" width="56" height="3" fill={LEATHER.light} opacity=".45" />
          <rect x="24" y="21" width="18" height="24" rx="4" fill="none" stroke={GOLD.mid} strokeWidth="4" />
          <rect x="30" y="28" width="4" height="10" rx="2" fill={GOLD.light} />
          <g fill={GOLD.dark}>
            <circle cx="12" cy="33" r="2" />
            <circle cx="18" cy="33" r="2" />
            <circle cx="50" cy="33" r="2" />
          </g>
        </>
      );
    case 'shoes-of-readiness':
      return (
        <>
          <path d="M10 42c0-10 3-16 3-22h12v14l14 6c4 2 6 4 6 8H10z" fill={LEATHER.mid} stroke={LEATHER.dark} strokeWidth="2" />
          <path d="M10 44h35v6H10z" fill="#332015" />
          <g stroke={GOLD.mid} strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 24h9M15 30h9M15 36h9" />
          </g>
          <path d="M46 18c6 2 9 7 8 13" fill="none" stroke={GOLD.mid} strokeWidth="2.4" strokeLinecap="round" />
        </>
      );
    case 'sword-of-the-spirit':
      return (
        <>
          <path d="M32 4l6 8v28h-12V12z" fill={STEEL.light} stroke={STEEL.dark} strokeWidth="1.5" />
          <path d="M32 4l6 8v28h-6z" fill={STEEL.mid} />
          <rect x="14" y="40" width="36" height="7" rx="3" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
          <rect x="29" y="47" width="6" height="11" fill={LEATHER.mid} stroke={LEATHER.dark} strokeWidth="1.2" />
          <circle cx="32" cy="59" r="4" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="1.5" />
        </>
      );
    default:
      return (
        <>
          <circle cx="32" cy="32" r="20" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="2" />
          <circle cx="26" cy="26" r="6" fill={GOLD.light} opacity=".6" />
        </>
      );
  }
}
