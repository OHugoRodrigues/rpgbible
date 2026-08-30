'use client';

import { AssetPlaceholder } from '@/components/dialogue/AssetPlaceholder';
import { RpgDialogue } from '@/components/dialogue/RpgDialogue';
import { ParakletosAvatar } from '@/components/guide/ParakletosAvatar';
import { BrookSkyfallPhase } from '@/components/games/trail-advanced/BrookSkyfallPhase';
import { DavidGoliathPhase } from '@/components/games/trail-advanced/DavidGoliathPhase';
import { ParakletosChallengePhase } from '@/components/games/trail-advanced/ParakletosChallengePhase';
import { SuppliesMergePhase } from '@/components/games/trail-advanced/SuppliesMergePhase';
import { SceneStage, type SceneVariant } from '@/components/scene/SceneStage';
import {
  DAVID_TRAIL_INTRO,
  DAVID_TRAIL_OUTRO,
  DAVID_TRAIL_TITLES,
} from '@/src/content/david-trail';
import { calculateDavidPhasePoints } from '@/src/domain/scoring';
import {
  DAVID_MISSION_PHASES,
  type DavidMissionPhaseId,
  type DavidMissionState,
  type SerializableValue,
} from '@/src/domain/types';
import { useState } from 'react';
import styles from './DavidTrailScreen.module.css';

export interface DavidTrailScreenProps {
  mission: DavidMissionState;
  onSavePhaseData: (
    phase: DavidMissionPhaseId,
    data: SerializableValue,
  ) => void;
  onCompletePhase: (phase: DavidMissionPhaseId, points: number) => void;
  onBack: () => void;
}

export function DavidTrailScreen({
  mission,
  onSavePhaseData,
  onCompletePhase,
  onBack,
}: DavidTrailScreenProps) {
  const phase = mission.currentPhase;
  const phaseNumber = DAVID_MISSION_PHASES.indexOf(phase) + 1;
  const totalPhases = DAVID_MISSION_PHASES.length;

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Voltar aos capítulos"
        >
          ◀
        </button>
        <div>
          <span className={styles.eyebrow}>
            O Guerreiro · Fase {phaseNumber} de {totalPhases}
          </span>
          <h1>{DAVID_TRAIL_TITLES[phase]}</h1>
        </div>
      </header>

      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Progresso da Trilha de Davi"
        aria-valuemin={0}
        aria-valuemax={totalPhases}
        aria-valuenow={mission.completedPhases.length}
      >
        <i
          style={{
            width: `${(mission.completedPhases.length / totalPhases) * 100}%`,
          }}
        />
      </div>

      <PhaseExperience
        key={phase}
        phase={phase}
        initialData={mission.phaseData[phase]}
        onSave={(data) => onSavePhaseData(phase, data)}
        onComplete={(data) =>
          onCompletePhase(phase, calculateDavidPhasePoints(phase, data))
        }
      />
    </section>
  );
}

function PhaseExperience({
  phase,
  initialData,
  onSave,
  onComplete,
}: {
  phase: DavidMissionPhaseId;
  initialData?: SerializableValue;
  onSave: (data: SerializableValue) => void;
  onComplete: (data: SerializableValue) => void;
}) {
  const [mode, setMode] = useState<'intro' | 'game' | 'outro'>(
    DAVID_TRAIL_INTRO[phase].length > 0 ? 'intro' : 'game',
  );
  const [line, setLine] = useState(0);
  const [result, setResult] = useState<SerializableValue>(null);
  const lines =
    mode === 'intro'
      ? DAVID_TRAIL_INTRO[phase]
      : DAVID_TRAIL_OUTRO[phase];

  function advanceDialogue() {
    if (line < lines.length - 1) {
      setLine((current) => current + 1);
      return;
    }
    setLine(0);
    if (mode === 'intro') {
      setMode('game');
      return;
    }
    onSave(result);
    onComplete(result);
  }

  function previousDialogue() {
    if (line > 0) setLine((current) => current - 1);
  }

  function gameComplete(payload: unknown = { completed: true }) {
    const serializable = toSerializable(payload);
    setResult(serializable);
    if (DAVID_TRAIL_OUTRO[phase].length > 0) {
      setMode('outro');
      return;
    }
    onSave(serializable);
    onComplete(serializable);
  }

  if (mode !== 'game') {
    const current = lines[line];
    if (!current) return null;
    return (
      <DialogueScene phase={phase}>
        <RpgDialogue
          key={`${mode}-${line}`}
          speaker={current.speaker}
          text={current.text}
          onPrevious={line > 0 ? previousDialogue : undefined}
          onComplete={advanceDialogue}
        />
      </DialogueScene>
    );
  }

  return (
    <div className={styles.phaseBody}>
      {renderPhase(phase, initialData, gameComplete, onSave)}
    </div>
  );
}

function DialogueScene({
  phase,
  children,
}: {
  phase: DavidMissionPhaseId;
  children: React.ReactNode;
}) {
  const variant: SceneVariant =
    phase === 'supplies-merge'
      ? 'house'
      : phase === 'brook-skyfall'
        ? 'camp'
        : phase === 'david-goliath'
          ? 'valley'
          : 'camp';

  return (
    <SceneStage
      variant={variant}
      className={styles.dialogueStage}
      label={`Cena de ${DAVID_TRAIL_TITLES[phase]}`}
    >
      <div className={styles.sceneCast} aria-hidden="true">
        {phase === 'supplies-merge' ? (
          <>
            <AssetPlaceholder asset="jesse" />
            <span className={styles.basket}>🧺</span>
          </>
        ) : null}
        {phase === 'david-goliath' ? (
          <AssetPlaceholder asset="goliath" />
        ) : null}
        {phase === 'parakletos-challenge' ? (
          <ParakletosAvatar className={styles.parakletosSprite} />
        ) : (
          <span className={styles.davidSprite}>🧑🏽‍🌾</span>
        )}
        {phase === 'brook-skyfall' ? (
          <span className={styles.campSoldiers}>🛡️ 🛡️ 🛡️</span>
        ) : null}
      </div>
      <div className={styles.dialogueBox}>{children}</div>
    </SceneStage>
  );
}

function renderPhase(
  phase: DavidMissionPhaseId,
  initialData: SerializableValue | undefined,
  complete: (payload?: unknown) => void,
  save: (data: SerializableValue) => void,
) {
  const progress = (value: unknown) => save(toSerializable(value));

  switch (phase) {
    case 'supplies-merge':
      return (
        <SuppliesMergePhase
          initialProgress={initialData}
          onProgress={progress}
          onComplete={complete}
        />
      );
    case 'brook-skyfall':
      return (
        <BrookSkyfallPhase
          initialProgress={initialData}
          onProgress={progress}
          onComplete={complete}
        />
      );
    case 'david-goliath':
      return (
        <DavidGoliathPhase
          initialProgress={initialData}
          onProgress={progress}
          onComplete={complete}
        />
      );
    case 'parakletos-challenge':
      return (
        <ParakletosChallengePhase
          initialProgress={initialData}
          onProgress={progress}
          onComplete={complete}
        />
      );
  }
}

function toSerializable(value: unknown): SerializableValue {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as SerializableValue;
}
