'use client';

import { Cartouche, GoldButton, Overline, ScrollPanel } from '@/components/frame';
import { QUIZ_QUESTIONS } from '@/src/content/pilot';
import { useState } from 'react';
import styles from './Screens.module.css';

const KEYS = ['A', 'B', 'C', 'D'];

/**
 * US09 — consolidação.
 *
 * Uma pergunta por vez, feedback imediato e a explicação sempre acompanhada da
 * referência: a mecânica termina devolvendo o usuário à Escritura.
 *
 * Errar não encerra a pergunta — o domínio só a marca como concluída no acerto,
 * e apenas o acerto de primeira tentativa pontua. Por isso a tela pede uma nova
 * tentativa em vez de seguir adiante com a resposta errada.
 */
export function QuizScreen({
  onAnswer,
  onComplete,
}: {
  onAnswer: (questionId: string, correct: boolean) => void;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [progress, setProgress] = useState<Record<string, 'correct' | 'answered'>>({});

  const question = QUIZ_QUESTIONS[index];
  const isLast = index === QUIZ_QUESTIONS.length - 1;

  function choose(option: number) {
    if (solved || wrong.includes(option)) return;
    const correct = option === question.correctOption;
    onAnswer(question.id, correct);

    if (correct) {
      setSolved(true);
      setProgress((current) => ({
        ...current,
        [question.id]: wrong.length === 0 ? 'correct' : 'answered',
      }));
      return;
    }

    setWrong((current) => [...current, option]);
    setProgress((current) => ({ ...current, [question.id]: 'answered' }));
  }

  function advance() {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((current) => current + 1);
    setWrong([]);
    setSolved(false);
  }

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.screenHeaderText}>
          <Overline>A Provação · Etapa 4 de 4</Overline>
          <h1>Consolide o aprendizado</h1>
        </div>
      </header>

      <p className={styles.srOnly} aria-live="polite">
        Pergunta {index + 1} de {QUIZ_QUESTIONS.length}
      </p>
      <div className={styles.quizProgress} aria-hidden="true">
        {QUIZ_QUESTIONS.map((item) => (
          <i key={item.id} data-state={progress[item.id] ?? 'pending'} />
        ))}
      </div>

      <p className={styles.quizPrompt}>{question.prompt}</p>

      <div className={styles.quizOptions}>
        {question.options.map((option, optionIndex) => {
          const isWrong = wrong.includes(optionIndex);
          const isCorrect = solved && optionIndex === question.correctOption;
          const state = isCorrect ? styles.quizOptionCorrect : isWrong ? styles.quizOptionWrong : '';

          return (
            <button
              key={option}
              type="button"
              className={`${styles.quizOption} ${state}`}
              disabled={solved || isWrong}
              onClick={() => choose(optionIndex)}
            >
              <span className={styles.quizOptionKey}>{KEYS[optionIndex]}</span>
              {option}
            </button>
          );
        })}
      </div>

      {solved ? (
        <ScrollPanel rolled className={styles.reveal}>
          <span className={styles.revealTitle}>
            {wrong.length === 0 ? 'Isso mesmo' : 'Agora sim'}
          </span>
          <p className={styles.revealBody}>{question.explanation}</p>
          <Cartouche reference={question.biblicalReference} onPaper />
        </ScrollPanel>
      ) : wrong.length > 0 ? (
        <p className={`${styles.feedback} ${styles.feedbackError}`} aria-live="polite">
          Ainda não é essa. Releia a pergunta e tente outra opção — voltar atrás faz parte da leitura.
        </p>
      ) : null}

      <div className={styles.screenActions}>
        <GoldButton disabled={!solved} onClick={advance}>
          {isLast ? 'Ver recompensas' : 'Próxima pergunta'}
        </GoldButton>
      </div>
    </section>
  );
}
