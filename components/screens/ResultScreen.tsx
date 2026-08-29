'use client';

import { Cartouche, DiamondDivider, GhostButton, GoldButton, GoldFrame, Overline } from '@/components/frame';
import { ItemIcon } from '@/components/item/ItemIcon';
import { findCollectible, findEquipment } from '@/src/content/rewards';
import type { MissionScore, Reward, RewardTier, WeeklyConsistency } from '@/src/domain/types';
import styles from './Screens.module.css';

const TIER_LABEL: Record<RewardTier, string> = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
};

const TIER_CLASS: Record<RewardTier, string> = {
  common: styles.tierBadgeCommon,
  rare: styles.tierBadgeRare,
  epic: styles.tierBadgeEpic,
};

/**
 * US11 + US12 — recompensa da missão.
 *
 * As duas economias aparecem lado a lado, mas nunca se confundem: o
 * colecionável registra "eu vivi essa história"; o equipamento mostra quem o
 * Peregrino está se tornando.
 */
export function ResultScreen({
  score,
  rewards,
  consistency,
  onShelf,
  onJourneys,
}: {
  score: MissionScore;
  rewards: readonly Reward[];
  consistency: WeeklyConsistency;
  onShelf: () => void;
  onJourneys: () => void;
}) {
  return (
    <section className={`${styles.screen} ${styles.rewardScene}`}>
      <span className={styles.rewardRays} aria-hidden="true" />

      <Overline>Missão concluída</Overline>
      <h1 style={{ fontSize: 'var(--size-3xl)', margin: 'var(--space-2) 0' }}>A Provação</h1>

      <div className={styles.scoreRow}>
        <span className={styles.scoreChip}>
          <strong>{score.discovery}</strong> Descoberta
        </span>
        <span className={styles.scoreChip}>
          <strong>{score.preparation}</strong> Preparação
        </span>
        <span className={styles.scoreChip}>
          <strong>{score.ar}</strong> Confronto
        </span>
        <span className={styles.scoreChip}>
          <strong>{score.quiz}</strong> Quiz
        </span>
        <span className={styles.scoreChip}>
          <strong>{score.total}</strong> Total
        </span>
      </div>

      <DiamondDivider label="Recompensas" />

      <div className={styles.rewardPair}>
        {rewards.map((reward) => {
          const definition =
            reward.kind === 'collectible' ? findCollectible(reward.id) : findEquipment(reward.id);

          return (
            <GoldFrame key={reward.id} innerClassName={styles.rewardCard}>
              <span className={styles.rewardArt}>
                <ItemIcon
                  itemId={reward.id}
                  asset={definition?.asset ?? ''}
                  name={reward.name}
                  tier={reward.tier}
                />
              </span>
              <span>
                <span className={styles.rewardKind}>
                  {reward.kind === 'collectible' ? 'Colecionável da história' : 'Equipamento do Peregrino'}
                </span>
                <span className={styles.rewardName}>{reward.name}</span>
                <span className={styles.rewardMeta}>{reward.source}</span>
                {reward.kind === 'equipment' ? (
                  <span className={`${styles.tierBadge} ${TIER_CLASS[reward.tier]}`}>
                    Qualidade {TIER_LABEL[reward.tier]}
                  </span>
                ) : null}
                <br />
                <Cartouche reference={reward.biblicalReference} className={styles.rewardMeta} />
              </span>
            </GoldFrame>
          );
        })}
      </div>

      <p className={styles.screenIntro} style={{ textAlign: 'center' }}>
        {consistency.completeWeek
          ? 'Semana completa: sete dias de contato com a Palavra. Seu equipamento alcançou a melhor qualidade da semana.'
          : consistency.goalReached
            ? `Meta semanal alcançada — ${consistency.activeDays.length}/7 dias. Seu Escudo da Fé foi aprimorado.`
            : `Você está em ${consistency.activeDays.length}/7 dias nesta semana. Faltam poucos para a meta de edificação.`}
      </p>

      <div className={styles.screenActions}>
        <GoldButton onClick={onShelf}>Ver estante e inventário</GoldButton>
        <GhostButton onClick={onJourneys}>Voltar às jornadas</GhostButton>
      </div>
    </section>
  );
}
