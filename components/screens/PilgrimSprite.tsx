'use client';

import type { PilgrimAppearance } from '@/src/domain/types';
import { useState } from 'react';
import styles from './Screens.module.css';

/**
 * Variantes de sprite que existem de fato em `public/assets/characters/`.
 *
 * A interface não sonda o servidor atrás de arte: pedir um arquivo ausente só
 * para descobrir que ele não existe enche o console de 404. Quando as variantes
 * de cabelo de `ref/5.png` e `ref/6.png` forem recortadas, basta acrescentar o
 * nome aqui — por exemplo `'pilgrim-male-long'` — e o seletor passa a mudar o
 * sprite sozinho.
 */
const AVAILABLE_VARIANTS = new Set<string>([]);

/** Sprite do Peregrino, resolvido a partir do que existe em disco. */
export function PilgrimSprite({
  appearance,
  className,
  alt = 'Seu Peregrino',
}: {
  appearance: PilgrimAppearance;
  className?: string;
  alt?: string;
}) {
  const sex = appearance.presentation === 'feminine' ? 'female' : 'male';
  const base = appearance.outfit === 'blue' ? `pilgrim-royal-${sex}` : `pilgrim-${sex}`;
  const withHair = `${base}-${appearance.hair}`;
  const name = AVAILABLE_VARIANTS.has(withHair) ? withHair : base;
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`${styles.pilgrimFallback} ${className ?? ''}`} role="img" aria-label={alt} />
    );
  }

  return (
    <img
      className={className}
      src={`/assets/characters/${name}.png`}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
