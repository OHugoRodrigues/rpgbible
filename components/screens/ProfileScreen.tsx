'use client';

import { Cartouche, GhostButton, GoldFrame, Overline, ScrollPanel } from '@/components/frame';
import { ItemIcon } from '@/components/item/ItemIcon';
import { COLLECTIBLES, EQUIPMENT } from '@/src/content/rewards';
import { WEEKLY_GOAL_DAYS } from '@/src/domain/progression';
import type { MissionScore, PilgrimAppearance, Reward, RewardTier, WeeklyConsistency } from '@/src/domain/types';
import { ChevronLeft, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PilgrimSprite } from './PilgrimSprite';
import styles from './Screens.module.css';

const WEEK = [
  { key: 'mon', label: 'Seg' },
  { key: 'tue', label: 'Ter' },
  { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' },
  { key: 'fri', label: 'Sex' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
] as const;

const TIER_LABEL: Record<RewardTier, string> = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
};

interface Detail {
  name: string;
  asset: string;
  itemId: string;
  description: string;
  source: string;
  reference: string;
  tier?: RewardTier;
}

/** US13 + US14 + US15 — estante, inventário e constância semanal. */
export function ProfileScreen({
  appearance,
  score,
  rewards,
  consistency,
  onBack,
  onReset,
}: {
  appearance: PilgrimAppearance;
  score: MissionScore;
  rewards: readonly Reward[];
  consistency: WeeklyConsistency;
  onBack: () => void;
  onReset: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* `showModal` dá focus trap, Escape e backdrop nativos — `open` não daria. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (detail && !dialog.open) dialog.showModal();
    if (!detail && dialog.open) dialog.close();
  }, [detail]);

  const ownedIds = new Set(rewards.map((reward) => reward.id));
  const equipmentTier = new Map(
    rewards.filter((reward) => reward.kind === 'equipment').map((reward) => [reward.id, reward.tier]),
  );
  const ownedCollectibles = COLLECTIBLES.filter((item) => ownedIds.has(item.id)).length;

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>Seu progresso</Overline>
          <h1>Peregrino</h1>
        </div>
      </header>

      <GoldFrame innerClassName={styles.profileHero}>
        <PilgrimSprite appearance={appearance} />
        <div>
          <span className={styles.controlLabel}>Pontuação da missão</span>
          <span className={styles.profileScore}>{score.total}</span>
          <span className={styles.rewardMeta}>
            {ownedCollectibles} de {COLLECTIBLES.length} colecionáveis · {ownedIds.size > 0 ? 'em jornada' : 'início da caminhada'}
          </span>
        </div>
      </GoldFrame>

      {/* Constância — edificação, nunca punição (spec §7) */}
      <GoldFrame innerClassName={styles.weekCard}>
        <div className={styles.weekTop}>
          <span className={styles.controlLabel}>Constância desta semana</span>
          <span className={styles.weekCount}>{consistency.activeDays.length}/7 dias</span>
        </div>

        <div className={styles.weekDays}>
          {WEEK.map((day, index) => {
            const active = consistency.activeDays.includes(day.key);
            const milestone = index === WEEKLY_GOAL_DAYS - 1 || index === WEEK.length - 1;
            return (
              <span
                key={day.key}
                className={[styles.weekDay, active && styles.weekDayActive, milestone && styles.weekDayMilestone]
                  .filter(Boolean)
                  .join(' ')}
                title={milestone ? (index === WEEK.length - 1 ? 'Semana completa' : 'Meta semanal') : undefined}
              >
                {day.label}
              </span>
            );
          })}
        </div>

        <p
          className={`${styles.weekBanner} ${consistency.completeWeek ? styles.weekBannerComplete : ''}`}
          aria-live="polite"
        >
          {consistency.completeWeek
            ? 'Semana completa. Bônus máximo de edificação aplicado ao seu equipamento.'
            : consistency.goalReached
              ? 'Meta semanal alcançada. Seu Escudo da Fé foi aprimorado.'
              : `Faltam ${WEEKLY_GOAL_DAYS - consistency.activeDays.length} dias para a meta de edificação desta semana.`}
        </p>
      </GoldFrame>

      {/* Estante de Jornadas — memória da história */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Estante de Jornadas</h2>
          <span className={styles.sectionCount}>
            {ownedCollectibles}/{COLLECTIBLES.length}
          </span>
        </div>

        <ul className={styles.shelfGrid}>
          {COLLECTIBLES.map((item) => {
            const owned = ownedIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.shelfItem}
                  disabled={!owned}
                  onClick={() =>
                    owned &&
                    setDetail({
                      name: item.name,
                      asset: item.asset,
                      itemId: item.id,
                      description: item.description,
                      source: item.source,
                      reference: item.biblicalReference,
                    })
                  }
                  aria-label={owned ? `${item.name}, conquistado` : `${item.name}, ainda não conquistado`}
                >
                  <GoldFrame tight innerClassName={styles.shelfFace}>
                    <span className={styles.shelfArt}>
                      <ItemIcon itemId={item.id} asset={item.asset} name={item.name} locked={!owned} />
                    </span>
                    <strong>{owned ? item.name : '???'}</strong>
                    <small>{item.source}</small>
                  </GoldFrame>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Inventário do Peregrino — quem ele está se tornando */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Inventário do Peregrino</h2>
          <span className={styles.sectionCount}>Armadura de Deus</span>
        </div>

        <ul className={styles.inventoryGrid}>
          {EQUIPMENT.map((item) => {
            const tier = equipmentTier.get(item.id);
            return (
              <li key={item.id}>
                <GoldFrame tight innerClassName={styles.inventorySlot}>
                  <span className={styles.slotName}>{item.slotName}</span>
                  <span className={styles.inventoryArt}>
                    <ItemIcon
                      itemId={item.id}
                      asset={item.asset}
                      name={item.name}
                      tier={tier}
                      locked={!tier}
                    />
                  </span>
                  <strong>{item.name}</strong>
                  <span className={styles.sectionCount}>
                    {tier ? `Qualidade ${TIER_LABEL[tier]}` : 'Não equipado'}
                  </span>
                </GoldFrame>
              </li>
            );
          })}
        </ul>
      </section>

      <GhostButton onClick={onReset} style={{ margin: '0 auto' }}>
        Reiniciar a demonstração
      </GhostButton>

      <dialog
        ref={dialogRef}
        className={styles.detailDialog}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setDetail(null)}
              aria-label="Fechar"
            >
              <X aria-hidden="true" />
            </button>
            <ScrollPanel rolled className={styles.detailBody}>
              <span className={styles.detailArt}>
                <ItemIcon itemId={detail.itemId} asset={detail.asset} name={detail.name} tier={detail.tier} />
              </span>
              <span className={styles.revealTitle}>{detail.name}</span>
              <p className={styles.revealBody}>{detail.description}</p>
              <span className={styles.rewardMeta} style={{ color: 'var(--ink-500)' }}>
                {detail.source}
              </span>
              <Cartouche reference={detail.reference} onPaper />
            </ScrollPanel>
          </>
        ) : null}
      </dialog>
    </section>
  );
}
