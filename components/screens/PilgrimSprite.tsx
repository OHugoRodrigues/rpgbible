'use client';

import { useState } from 'react';
import type { PilgrimAppearance } from '@/src/domain/types';

/**
 * Sprite do Peregrino.
 *
 * Tenta primeiro a variante completa (traje + apresentação + cabelo) e cai para
 * o sprite base quando aquela arte ainda não existe. As variantes de cabelo de
 * `ref/5.png` e `ref/6.png` entram só soltando os PNGs em
 * `public/assets/characters/` com o nome esperado — nenhuma mudança de código.
 */
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
  const preferred = `/assets/characters/${base}-${appearance.hair}.png`;
  const fallback = `/assets/characters/${base}.png`;

  /* Guarda apenas as variantes que faltaram, para o src derivar da aparência. */
  const [missing, setMissing] = useState<string[]>([]);
  const src = missing.includes(preferred) ? fallback : preferred;

  return (
    <img
      key={preferred}
      className={className}
      src={src}
      alt={alt}
      onError={() => {
        if (src === preferred) setMissing((current) => [...current, preferred]);
      }}
    />
  );
}
