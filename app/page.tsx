'use client';

import { ParakletosGuide } from '@/components/guide/ParakletosGuide';
import { Hud } from '@/components/hud/Hud';
import { ArScreen } from '@/components/screens/ArScreen';
import { CalibrationScreen } from '@/components/screens/CalibrationScreen';
import { ChaptersScreen } from '@/components/screens/ChaptersScreen';
import { DiscoveryScreen } from '@/components/screens/DiscoveryScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { JourneysScreen } from '@/components/screens/JourneysScreen';
import { PilgrimScreen } from '@/components/screens/PilgrimScreen';
import { PreparationScreen } from '@/components/screens/PreparationScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { QuizScreen } from '@/components/screens/QuizScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import type { ChapterId } from '@/src/domain/types';
import { useState } from 'react';
import { DemoStoreProvider, useDemoActions, useDemoStore, useHydrated } from './providers/store-provider';
import styles from '@/components/screens/Screens.module.css';

export default function Page() {
  return (
    <DemoStoreProvider>
      <Experience />
    </DemoStoreProvider>
  );
}

/**
 * Orquestra as telas a partir do `DemoStep` do domínio.
 *
 * Nenhuma regra de jogo vive aqui: score, recompensa, constância e validação
 * vêm de `@/src`, como manda `docs/frontend-handoff.md`. A calibração é o único
 * passo puramente de interface, porque é opcional e não altera o domínio até
 * `completeOnboarding` ser chamado.
 */
function Experience() {
  const hydrated = useHydrated();
  const actions = useDemoActions();

  const step = useDemoStore((state) => state.currentStep);
  const appearance = useDemoStore((state) => state.appearance);
  const personalization = useDemoStore((state) => state.personalization);
  const score = useDemoStore((state) => state.score);
  const rewards = useDemoStore((state) => state.rewards);
  const consistency = useDemoStore((state) => state.consistency);
  const missionCompleted = useDemoStore((state) => state.missionCompleted);

  const [calibrating, setCalibrating] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  /* Evita divergência entre servidor e cliente antes da reidratação do persist. */
  if (!hydrated) return <main className={styles.world} />;

  const completedChapters: ChapterId[] = missionCompleted ? ['provacao'] : [];
  const showHud = step !== 'home' && !calibrating;

  function finishMission() {
    actions.finalizeMission();
  }

  return (
    <main className={styles.world}>
      <div className={styles.candle} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      {showHud ? (
        <Hud
          score={score.total}
          activeDays={consistency.activeDays.length}
          onJourneys={() => actions.goTo('journeys')}
          onProfile={() => actions.goTo('profile')}
          onGuide={() => setGuideOpen(true)}
        />
      ) : null}

      {calibrating ? (
        <CalibrationScreen
          onComplete={(answers) => {
            actions.completeOnboarding(answers);
            setCalibrating(false);
            actions.goTo('journeys');
          }}
          onBack={() => setCalibrating(false)}
        />
      ) : (
        <>
          {step === 'home' ? (
            <HomeScreen
              onStart={() => actions.goTo('pilgrim')}
              onContinue={missionCompleted ? () => actions.goTo('profile') : undefined}
            />
          ) : null}

          {step === 'pilgrim' ? (
            <PilgrimScreen
              appearance={appearance}
              onChange={(next) => actions.setAppearance(next)}
              onConfirm={() => setCalibrating(true)}
              onSkip={() => actions.goTo('journeys')}
              onBack={() => actions.goTo('home')}
            />
          ) : null}

          {step === 'journeys' ? (
            <JourneysScreen
              onSelect={() => actions.goTo('chapters')}
              onBack={() => actions.goTo('pilgrim')}
            />
          ) : null}

          {step === 'chapters' ? (
            <ChaptersScreen
              completedChapters={completedChapters}
              onPlay={() => actions.goTo('discovery')}
              onBack={() => actions.goTo('journeys')}
            />
          ) : null}

          {step === 'discovery' ? (
            <DiscoveryScreen
              onComplete={() => {
                actions.completeDiscovery();
                actions.goTo('preparation');
              }}
              onBack={() => actions.goTo('chapters')}
            />
          ) : null}

          {step === 'preparation' ? (
            <PreparationScreen
              onComplete={() => {
                actions.completePreparation();
                actions.goTo('ar');
              }}
              onBack={() => actions.goTo('discovery')}
            />
          ) : null}

          {step === 'ar' ? (
            <ArScreen
              appearance={appearance}
              onResult={(hit) => {
                actions.recordArResult(hit);
                if (hit) actions.goTo('quiz');
              }}
              onBack={() => actions.goTo('preparation')}
            />
          ) : null}

          {step === 'quiz' ? (
            <QuizScreen onAnswer={(id, correct) => actions.answerQuiz(id, correct)} onComplete={finishMission} />
          ) : null}

          {step === 'result' ? (
            <ResultScreen
              score={score}
              rewards={rewards}
              consistency={consistency}
              onShelf={() => actions.goTo('profile')}
              onJourneys={() => actions.goTo('journeys')}
            />
          ) : null}

          {step === 'profile' ? (
            <ProfileScreen
              appearance={appearance}
              score={score}
              rewards={rewards}
              consistency={consistency}
              onBack={() => actions.goTo('journeys')}
              onReset={() => actions.resetDemo()}
            />
          ) : null}
        </>
      )}

      <ParakletosGuide
        open={guideOpen}
        stageId="trial"
        profile={personalization?.profile ?? null}
        onClose={() => setGuideOpen(false)}
      />
    </main>
  );
}
