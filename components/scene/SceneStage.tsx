'use client';

import { useState, type ReactNode } from 'react';
import styles from './SceneStage.module.css';

export type SceneVariant = 'valley' | 'camp' | 'pasture' | 'house' | 'brook';

/**
 * Palco de cena em camadas.
 *
 * A arte procedural em CSS é sempre desenhada. Se existir um PNG em
 * `public/assets/scenes/<variant>.png`, ele é sobreposto e cobre o procedural;
 * se o arquivo não existir, a imagem se remove sozinha no `onError` e a cena
 * desenhada continua no lugar. Trocar pela arte definitiva é soltar o arquivo
 * na pasta, sem tocar em código.
 */
export function SceneStage({
  variant,
  children,
  className,
  label,
}: {
  variant: SceneVariant;
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  const [artFailed, setArtFailed] = useState(false);

  return (
    <div
      className={[styles.stage, styles[variant], className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <div className={`${styles.layer} ${styles.sky}`} />
      {variant !== 'camp' && variant !== 'house' ? (
        <div className={`${styles.layer} ${styles.ridgeFar}`} />
      ) : null}
      {variant === 'valley' ? (
        <>
          <span className={styles.sun} />
          <div className={`${styles.layer} ${styles.ridgeLeft}`} />
          <div className={`${styles.layer} ${styles.ridgeRight}`} />
        </>
      ) : null}
      <div className={`${styles.layer} ${styles.floor}`} />
      <div className={`${styles.layer} ${styles.foreground}`} />

      {artFailed ? null : (
        <img
          className={styles.art}
          src={`/assets/scenes/${variant}.png`}
          alt=""
          aria-hidden="true"
          onError={() => setArtFailed(true)}
        />
      )}

      <div className={`${styles.layer} ${styles.haze}`} />
      <div className={`${styles.layer} ${styles.grain}`} aria-hidden="true" />
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
