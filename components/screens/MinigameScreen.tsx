'use client';

import { Cartouche, GhostButton, GoldButton, Overline, ScrollPanel } from '@/components/frame';
import { getDavidMinigame } from '@/src/content/minigames';
import { GUIDED_READING_COOLDOWN_MS } from '@/src/games/minigame-engine';
import { BrowserRecoveryNotifier } from '@/src/games/browser-recovery-notifier';
import type { MinigameSession, RecoveryMode } from '@/src/games/types';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './Screens.module.css';

const MATERIAL_LABEL: Record<string, string> = {
  straw: 'Palha',
  grass: 'Capim',
  wood: 'Madeira',
  silver: 'Prata',
  gold: 'Ouro',
  gemstone: 'Pedra preciosa',
};

export function MinigameScreen({
  session,
  onStart,
  onAnswer,
  onChooseRecovery,
  onRecoveryAnswer,
  onResume,
  onComplete,
  onBack,
}: {
  session: MinigameSession | undefined;
  onStart: () => void;
  onAnswer: (answer: string) => void;
  onChooseRecovery: (mode: RecoveryMode) => void;
  onRecoveryAnswer: (answer: string) => void;
  onResume: () => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const definition = getDavidMinigame('trial');
  const variant = definition.variants[session?.mode ?? 'balanced'];
  const [draft, setDraft] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session?.status !== 'cooldown' || !session.cooldownAvailableAt) return;
    const notifier = new BrowserRecoveryNotifier();
    notifier.schedule({
      id: 'trial-guided-reading',
      availableAt: session.cooldownAvailableAt,
      title: 'Peregrino',
      body: 'Você já pode responder o desafio de novo.',
    });
    return () => notifier.dispose();
  }, [session?.status, session?.cooldownAvailableAt]);

  const remainingMs = session ? Math.max(0, Date.parse(session.deadlineAt) - now) : 0;
  const cooldownMs = session?.cooldownAvailableAt
    ? Math.max(0, Date.parse(session.cooldownAvailableAt) - now)
    : 0;
  const cooldownReady = session?.status === 'cooldown' && cooldownMs === 0;

  function submitChallenge() {
    if (!draft.trim()) return;
    onAnswer(draft);
    setDraft('');
  }

  function pickChoice(choice: string) {
    onAnswer(choice);
  }

  function appendLetter(letter: string) {
    setDraft((current) => current + letter);
  }

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>A Provação · Desafio</Overline>
          <h1>{variant.title}</h1>
          <p className={styles.screenIntro}>{variant.instructions}</p>
        </div>
      </header>

      <p className={styles.screenIntro}>{definition.historicalContext}</p>
      <p className={styles.quizPrompt}>{variant.prompt}</p>
      <Cartouche reference={definition.biblicalReferences[0] ?? ''} />

      {session ? null : (
        <GoldButton onClick={onStart}>Começar o desafio</GoldButton>
      )}

      {session && session.status === 'active' ? (
        <div className={styles.minigameMeta} aria-live="polite">
          <span>
            Vidas {'♥'.repeat(session.livesRemaining)}
            {'♡'.repeat(Math.max(0, session.maxLives - session.livesRemaining))}
          </span>
          <span>Tempo {Math.ceil(remainingMs / 1000)}s</span>
        </div>
      ) : null}

      {session?.status === 'active' ? (
        <>
          {variant.choices ? (
            <div className={styles.quizOptions}>
              {variant.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={styles.quizOption}
                  onClick={() => pickChoice(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : null}

          {variant.letterBank ? (
            <div className={styles.letterBank}>
              {variant.letterBank.split('').map((letter, index) => (
                <button
                  key={`${letter}-${index}`}
                  type="button"
                  className={styles.letterKey}
                  onClick={() => appendLetter(letter)}
                >
                  {letter}
                </button>
              ))}
              <GhostButton
                onClick={() => setDraft('')}
              >
                Limpar
              </GhostButton>
            </div>
          ) : null}

          {!variant.choices ? (
            <form
              className={styles.minigameForm}
              onSubmit={(event) => {
                event.preventDefault();
                submitChallenge();
              }}
            >
              <label htmlFor="minigame-answer" className={styles.srOnly}>
                Resposta
              </label>
              <input
                id="minigame-answer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoComplete="off"
              />
              <GoldButton type="submit">Responder</GoldButton>
            </form>
          ) : null}
        </>
      ) : null}

      {session?.status === 'recovery-required' ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>As três vidas acabaram</span>
          <p className={styles.revealBody}>
            Não há bloqueio permanente. Recupere uma vida com a checagem da passagem, ou leia com
            calma e volte em uma hora.
          </p>
          <div className={styles.screenActions}>
            <GoldButton onClick={() => onChooseRecovery('context-task')}>Checagem da passagem</GoldButton>
            <GhostButton onClick={() => onChooseRecovery('guided-reading')}>
              Leitura guiada ({GUIDED_READING_COOLDOWN_MS / 60000} min)
            </GhostButton>
          </div>
        </ScrollPanel>
      ) : null}

      {session?.status === 'recovery-task' ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>Leitura de recuperação</span>
          <p className={styles.revealBody}>{definition.recoveryReading.readingPrompt}</p>
          <Cartouche reference={definition.recoveryReading.biblicalReference} onPaper />
          <p className={styles.quizPrompt}>{definition.recoveryReading.checkQuestion}</p>
          <form
            className={styles.minigameForm}
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              onRecoveryAnswer(draft);
              setDraft('');
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Resposta da checagem"
            />
            <GoldButton type="submit">Conferir</GoldButton>
          </form>
        </ScrollPanel>
      ) : null}

      {session?.status === 'cooldown' ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>Leitura guiada</span>
          <p className={styles.revealBody}>{definition.recoveryReading.readingPrompt}</p>
          <Cartouche reference={definition.recoveryReading.biblicalReference} onPaper />
          {cooldownReady ? (
            <>
              <p className={styles.feedback}>Você já pode responder.</p>
              <GoldButton onClick={onResume}>Retomar o desafio</GoldButton>
            </>
          ) : (
            <p className={styles.feedback}>
              Volte em {Math.ceil(cooldownMs / 60000)} min. O progresso fica salvo neste aparelho.
            </p>
          )}
        </ScrollPanel>
      ) : null}

      {session?.status === 'completed' ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>Desafio concluído</span>
          <p className={styles.revealBody}>
            {session.reward
              ? `Material: ${MATERIAL_LABEL[session.reward.material] ?? session.reward.material} (${session.reward.score} pts).`
              : 'A passagem está consolidada.'}
          </p>
          <GoldButton onClick={onComplete}>Seguir para o vale</GoldButton>
        </ScrollPanel>
      ) : null}
    </section>
  );
}
