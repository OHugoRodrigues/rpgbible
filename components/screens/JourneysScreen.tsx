'use client';

import { GoldFrame, LockBadge, Overline } from '@/components/frame';
import { PILOT_JOURNEYS } from '@/src/content/pilot';
import type { JourneyId } from '@/src/domain/types';
import { ChevronLeft } from 'lucide-react';
import { JourneyEmblem } from './JourneyEmblem';
import styles from './Screens.module.css';

/**
 * US03 + US04 — o Universo de Jornadas.
 *
 * É esta tela que comunica que Davi é a primeira experiência de uma plataforma
 * maior: as outras cinco aparecem apagadas, com cadeado, e não abrem conteúdo
 * inexistente.
 */
export function JourneysScreen({
  onSelect,
  onBack,
}: {
  onSelect: (journey: JourneyId) => void;
  onBack: () => void;
}) {
  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>Universo de jornadas</Overline>
          <h1>Escolha um caminho</h1>
          <p className={styles.screenIntro}>
            Cada jornada é uma história bíblica inteira, com seus próprios capítulos, missões e
            colecionáveis. Davi abre a estrada.
          </p>
        </div>
      </header>

      <ul className={styles.journeyGrid}>
        {PILOT_JOURNEYS.map((journey) => (
          <li key={journey.id}>
            <button
              type="button"
              className={styles.journeyCard}
              data-available={journey.available}
              disabled={!journey.available}
              onClick={() => journey.available && onSelect(journey.id)}
              aria-label={
                journey.available
                  ? `${journey.name} — ${journey.theme}. Disponível.`
                  : `${journey.name} — ${journey.theme}. Em breve.`
              }
            >
              <GoldFrame tight innerClassName={journey.available ? undefined : styles.lockedInner}>
                <div className={journey.available ? undefined : styles.lockedCard}>
                  <div className={styles.journeyInner}>
                    <span className={styles.journeyEmblem}>
                      <JourneyEmblem journey={journey.id} />
                    </span>
                    <span className={styles.journeyName}>{journey.name}</span>
                    <span className={styles.journeyTheme}>{journey.theme}</span>
                    <span className={styles.journeyStatus}>
                      {journey.available ? '5 capítulos · 1 jogável' : 'Conteúdo futuro'}
                    </span>
                  </div>
                </div>
                {journey.available ? null : <LockBadge />}
              </GoldFrame>
            </button>
          </li>
        ))}
      </ul>

      <p className={styles.journeyFootnote}>
        As jornadas bloqueadas mostram o que vem pela frente. Nada aqui abre conteúdo que ainda não
        existe.
      </p>
    </section>
  );
}
