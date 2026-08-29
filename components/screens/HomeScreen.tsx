'use client';

import { GoldButton } from '@/components/frame';
import { ChevronRight } from 'lucide-react';
import styles from './Screens.module.css';

/** US01 — entrar sem cadastro, em poucas interações. */
export function HomeScreen({
  onStart,
  onContinue,
}: {
  onStart: () => void;
  onContinue?: () => void;
}) {
  return (
    <section className={styles.home}>
      <img className={styles.homeCover} src="/assets/brand/rpg-bible-cover.png" alt="" />
      <div className={styles.homeShade} />

      <div className={styles.homeCopy}>
        <span className={styles.overline}>Plataforma de engajamento bíblico</span>
        <h1>Peregrino</h1>
        <p>
          As Escrituras viram jornadas interativas. Crie seu Peregrino, viva a história de Davi e
          descubra o que a coragem dele tem a ver com a sua caminhada.
        </p>

        <div className={styles.homeMeta}>
          <span>6 jornadas</span>
          <span>Missão em realidade aumentada</span>
          <span>Sem cadastro</span>
        </div>

        <GoldButton wide onClick={onStart}>
          Iniciar a jornada
          <ChevronRight aria-hidden="true" size={18} />
        </GoldButton>

        {onContinue ? (
          <button type="button" className={styles.textLink} onClick={onContinue}>
            Continuar de onde parei
          </button>
        ) : null}
      </div>
    </section>
  );
}
