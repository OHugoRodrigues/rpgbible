'use client';

import { Cartouche, GoldButton, GoldFrame, Overline, ScrollPanel } from '@/components/frame';
import { ItemIcon } from '@/components/item/ItemIcon';
import { PREPARATION_ITEMS } from '@/src/content/pilot';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import styles from './Screens.module.css';

/** Arte de cada item; o vetor de reserva entra quando o PNG não existe. */
const ART: Record<string, string> = {
  staff: '/assets/items/staff.png',
  sling: '/assets/items/sling.png',
  stones: '/assets/items/stones.png',
  armor: '/assets/items/breastplate.png',
  sword: '/assets/items/sword.png',
  shield: '/assets/items/shield.png',
};

const VECTOR_ID: Record<string, string> = {
  staff: 'shepherd-staff',
  sling: 'sling-of-david',
  stones: 'stone-of-david',
  armor: 'breastplate-of-righteousness',
  sword: 'sword-of-the-spirit',
  shield: 'shield-of-faith',
};

const CORRECT_COUNT = PREPARATION_ITEMS.filter((item) => item.correct).length;

/**
 * US07 — prepare Davi.
 *
 * Errar aqui não pune: explica. A recusa da armadura de Saul é o conteúdo, e
 * ela aparece exatamente quando o usuário tenta levá-la.
 */
export function PreparationScreen({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const ready = chosen.length === CORRECT_COUNT;

  function pick(id: string) {
    const item = PREPARATION_ITEMS.find((candidate) => candidate.id === id);
    if (!item) return;

    if (!item.correct) {
      setRejected((current) => (current.includes(id) ? current : [...current, id]));
      setFeedback({
        error: true,
        text:
          'Saul vestiu Davi com sua própria armadura, mas ele não conseguiu andar com ela — nunca a havia experimentado. Davi tirou tudo e foi com o que já dominava.',
      });
      return;
    }

    const next = chosen.includes(id) ? chosen.filter((value) => value !== id) : [...chosen, id];
    setChosen(next);
    setFeedback(
      next.length === CORRECT_COUNT
        ? { error: false, text: 'Cajado, funda e cinco pedras lisas do ribeiro. Davi desce ao vale com o que treinou no campo.' }
        : null,
    );
  }

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>A Provação · Etapa 2 de 4</Overline>
          <h1>Prepare Davi</h1>
          <p className={styles.screenIntro}>
            Escolha o que Davi levou para enfrentar Golias. Três itens — e nenhum deles foi
            emprestado.
          </p>
        </div>
      </header>

      <ul className={styles.loadoutGrid}>
        {PREPARATION_ITEMS.map((item) => {
          const isChosen = chosen.includes(item.id);
          const isRejected = rejected.includes(item.id);

          return (
            <li key={item.id}>
              <button
                type="button"
                className={[
                  styles.loadoutItem,
                  isChosen && styles.loadoutChosen,
                  isRejected && styles.loadoutRejected,
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={isRejected}
                onClick={() => pick(item.id)}
                aria-pressed={isChosen}
                aria-label={item.label}
              >
                <GoldFrame tight innerClassName={styles.loadoutFace}>
                  <span className={styles.loadoutArt}>
                    <ItemIcon
                      itemId={VECTOR_ID[item.id] ?? 'default'}
                      asset={ART[item.id] ?? ''}
                      name={item.label}
                    />
                  </span>
                  <strong>{item.label}</strong>
                </GoldFrame>
              </button>
            </li>
          );
        })}
      </ul>

      {feedback ? (
        <p
          className={`${styles.feedback} ${feedback.error ? styles.feedbackError : ''}`}
          aria-live="polite"
        >
          {feedback.text}
        </p>
      ) : null}

      {rejected.length > 0 ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>Por que não a armadura?</span>
          <p className={styles.revealBody}>
            Davi não recusou a proteção por orgulho. Ele recusou o que nunca havia usado, e escolheu
            as ferramentas que sabia manejar. Coragem, aqui, é conhecer a própria medida.
          </p>
          <Cartouche reference="1 Samuel 17:38-40" onPaper />
        </ScrollPanel>
      ) : null}

      <div className={styles.screenActions}>
        <GoldButton disabled={!ready} onClick={onComplete}>
          {ready ? 'Descer ao vale' : `Escolha ${CORRECT_COUNT} itens`}
        </GoldButton>
      </div>
    </section>
  );
}
