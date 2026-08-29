'use client';

import { Cartouche, GoldButton, Overline, ScrollPanel } from '@/components/frame';
import { SceneStage } from '@/components/scene/SceneStage';
import { DISCOVERY_HOTSPOTS } from '@/src/content/pilot';
import { ChevronLeft, Search } from 'lucide-react';
import { useState } from 'react';
import styles from './Screens.module.css';

/** Posição de cada elemento sobre a cena do vale de Elá. */
const PLACEMENT: Record<string, { left: string; top: string }> = {
  israel: { left: '18%', top: '52%' },
  philistines: { left: '82%', top: '50%' },
  goliath: { left: '63%', top: '66%' },
  valley: { left: '42%', top: '80%' },
};

/**
 * US06 — o contexto vira gameplay.
 *
 * Nada de NPC despejando parágrafos: o usuário toca os elementos da cena e cada
 * toque devolve uma explicação curta com a referência bíblica correspondente.
 */
export function DiscoveryScreen({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  const [found, setFound] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const hotspot = DISCOVERY_HOTSPOTS.find((item) => item.id === active);
  const allFound = found.length === DISCOVERY_HOTSPOTS.length;

  function reveal(id: string) {
    setActive(id);
    setFound((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>A Provação · Etapa 1 de 4</Overline>
          <h1>Descubra o cenário</h1>
          <p className={styles.screenIntro}>
            Dois exércitos, um vale entre eles e um desafio repetido todos os dias. Toque nos quatro
            elementos da cena para entender onde Davi chegou.
          </p>
        </div>
      </header>

      <SceneStage variant="valley" label="O vale de Elá, com os dois exércitos em encostas opostas">
        {DISCOVERY_HOTSPOTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.hotspot} ${found.includes(item.id) ? styles.hotspotFound : ''}`}
            style={PLACEMENT[item.id]}
            onClick={() => reveal(item.id)}
            aria-label={item.label}
          >
            <Search aria-hidden="true" />
          </button>
        ))}
      </SceneStage>

      <div className={styles.discoveryTally} aria-live="polite">
        {DISCOVERY_HOTSPOTS.map((item) => (
          <i key={item.id} data-done={found.includes(item.id)} />
        ))}
        <span>
          {found.length}/{DISCOVERY_HOTSPOTS.length} elementos identificados
        </span>
      </div>

      {hotspot ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>{hotspot.label}</span>
          <p className={styles.revealBody}>{hotspot.copy}</p>
          <Cartouche reference={hotspot.biblicalReference} onPaper />
        </ScrollPanel>
      ) : null}

      <div className={styles.screenActions}>
        <GoldButton disabled={!allFound} onClick={onComplete}>
          {allFound ? 'Preparar Davi' : 'Identifique os quatro elementos'}
        </GoldButton>
      </div>
    </section>
  );
}
