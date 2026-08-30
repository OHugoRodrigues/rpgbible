'use client';

import { ParakletosGuide } from '@/components/guide/ParakletosGuide';
import { Hud } from '@/components/hud/Hud';
import { CalibrationScreen } from '@/components/screens/CalibrationScreen';
import { ChaptersScreen } from '@/components/screens/ChaptersScreen';
import { DavidTrailScreen } from '@/components/screens/DavidTrailScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { JourneysScreen } from '@/components/screens/JourneysScreen';
import { PilgrimScreen } from '@/components/screens/PilgrimScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import {
  canResumeDemo,
  parakletosStageFor,
  resumeDemoStep,
} from '@/src/application/demo-flow';
import { getPersonalizedDavidStages, getStoryRecommendations } from '@/src/application/personalization-engine';
import { STORY_RECOMMENDATIONS } from '@/src/content/adaptive-journeys';
import { DEMO_SCHEMA_VERSION, type ChapterId, type JourneyId } from '@/src/domain/types';
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
  const davidMission = useDemoStore((state) => state.davidMission);
  const stageResults = useDemoStore((state) => state.stageResults);
  const minigameProgress = useDemoStore((state) => state.minigameProgress);
  const quizAnswers = useDemoStore((state) => state.quizAnswers);
  const [calibrating, setCalibrating] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  if (!hydrated) return <main className={styles.world} />;

  const completedChapters: ChapterId[] = missionCompleted ? ['provacao'] : [];
  const showHud = step !== 'home' && !calibrating;
  const personalized = personalization !== null;
  const chapterStages = personalization ? getPersonalizedDavidStages(personalization) : undefined;
  const stories = personalization
    ? getStoryRecommendations(personalization.profile.narrativePreference)
    : STORY_RECOMMENDATIONS.filter((story) => story.context === 'adventure');

  const resumeState = {
    schemaVersion: DEMO_SCHEMA_VERSION,
    appearance,
    personalization,
    minigameProgress,
    davidMission,
    currentStep: step,
    stageResults,
    quizAnswers,
    score,
    rewards,
    consistency,
    missionCompleted,
    updatedAt: '',
  };

  function playChapter(chapter: ChapterId) {
    if (chapter !== 'provacao') return;
    actions.startDavidMission();
  }

  function selectJourney(journey: JourneyId) {
    if (journey !== 'davi') return;
    actions.goTo('chapters');
  }

  return (
    <main className={styles.world}>
      <div className={styles.candle} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      {showHud ? (
        <Hud
          score={score.total}
          activeDays={consistency.activeDays.length}
          genericTone={!personalized}
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
              onContinue={
                canResumeDemo(resumeState) ? () => actions.goTo(resumeDemoStep(resumeState)) : undefined
              }
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
            <JourneysScreen onSelect={selectJourney} onBack={() => actions.goTo('pilgrim')} />
          ) : null}

          {step === 'chapters' ? (
            <ChaptersScreen
              completedChapters={completedChapters}
              stages={chapterStages}
              davidMission={davidMission}
              onPlay={playChapter}
              onBack={() => actions.goTo('journeys')}
            />
          ) : null}

          {step === 'david-mission' && davidMission ? (
            <DavidTrailScreen
              mission={davidMission}
              onSavePhaseData={(phase, data) => actions.updateDavidPhaseData(phase, data)}
              onCompletePhase={(phase, points) =>
                actions.completeDavidPhase(phase, points)
              }
              onBack={() => actions.goTo('chapters')}
            />
          ) : null}

          {step === 'result' ? (
            <ResultScreen
              score={score}
              rewards={rewards}
              consistency={consistency}
              davidMission={davidMission}
              onReplay={() => actions.startDavidMission()}
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
              stories={stories}
              genericTone={!personalized}
              onBack={() => actions.goTo('journeys')}
              onReset={() => actions.resetDemo()}
            />
          ) : null}
        </>
      )}

      <ParakletosGuide
        open={guideOpen}
        stageId={parakletosStageFor(step, calibrating, davidMission?.currentPhase)}
        profile={personalization?.profile ?? null}
        personalized={personalized}
        onClose={() => setGuideOpen(false)}
      />
    </main>
  );
}
