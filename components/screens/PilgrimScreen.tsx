'use client';

import { DiamondDivider, GhostButton, GoldButton, Overline } from '@/components/frame';
import type { PilgrimAppearance } from '@/src/domain/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PilgrimSprite } from './PilgrimSprite';
import styles from './Screens.module.css';

const PRESENTATIONS = [
  { value: 'masculine', label: 'Peregrino' },
  { value: 'feminine', label: 'Peregrina' },
] as const;

const HAIRS = [
  { value: 'short', label: 'Curto' },
  { value: 'long', label: 'Longo' },
] as const;

const OUTFITS = [
  { value: 'sand', label: 'Manto de viagem', swatch: styles.swatchSand },
  { value: 'blue', label: 'Traje de corte', swatch: styles.swatchBlue },
] as const;

/** US02 — personalizar rápido, com preview imediato e opção de pular. */
export function PilgrimScreen({
  appearance,
  onChange,
  onConfirm,
  onSkip,
  onBack,
}: {
  appearance: PilgrimAppearance;
  onChange: (next: PilgrimAppearance) => void;
  onConfirm: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>Sua identidade na jornada</Overline>
          <h1>Seu Peregrino</h1>
        </div>
      </header>

      <div className={styles.pilgrim}>
        <div className={styles.pilgrimStage}>
          <span className={styles.pilgrimGlow} aria-hidden="true" />
          <PilgrimSprite appearance={appearance} />
        </div>

        <div className={styles.pilgrimControls}>
          <fieldset className={styles.controlGroup}>
            <legend className={styles.controlLabel}>Apresentação</legend>
            <div className={styles.segmented}>
              {PRESENTATIONS.map((option) => (
                <span key={option.value}>
                  <input
                    type="radio"
                    id={`presentation-${option.value}`}
                    name="presentation"
                    checked={appearance.presentation === option.value}
                    onChange={() => onChange({ ...appearance, presentation: option.value })}
                  />
                  <label htmlFor={`presentation-${option.value}`}>{option.label}</label>
                </span>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.controlGroup}>
            <legend className={styles.controlLabel}>Cabelo</legend>
            <div className={styles.segmented}>
              {HAIRS.map((option) => (
                <span key={option.value}>
                  <input
                    type="radio"
                    id={`hair-${option.value}`}
                    name="hair"
                    checked={appearance.hair === option.value}
                    onChange={() => onChange({ ...appearance, hair: option.value })}
                  />
                  <label htmlFor={`hair-${option.value}`}>{option.label}</label>
                </span>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.controlGroup}>
            <legend className={styles.controlLabel}>Traje</legend>
            <div className={styles.swatches}>
              {OUTFITS.map((option) => (
                <span key={option.value}>
                  <input
                    type="radio"
                    id={`outfit-${option.value}`}
                    name="outfit"
                    checked={appearance.outfit === option.value}
                    onChange={() => onChange({ ...appearance, outfit: option.value })}
                  />
                  <label
                    htmlFor={`outfit-${option.value}`}
                    className={option.swatch}
                    title={option.label}
                  >
                    <span className={styles.srOnly}>{option.label}</span>
                  </label>
                </span>
              ))}
            </div>
          </fieldset>

          <DiamondDivider />
          <p className={styles.screenIntro}>
            O traje começa simples de propósito. Ele evolui conforme seu Peregrino avança nas jornadas.
          </p>
        </div>
      </div>

      <div className={styles.screenActions}>
        <GoldButton onClick={onConfirm}>
          Escolher jornada
          <ChevronRight aria-hidden="true" size={18} />
        </GoldButton>
        <GhostButton onClick={onSkip}>Pular personalização</GhostButton>
      </div>
    </section>
  );
}
