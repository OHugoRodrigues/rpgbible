'use client';

import { Overline } from '@/components/frame';
import { PARAKLETOS_IDENTITY_NOTICE } from '@/src/llm/parakletos-policy';
import type { OnboardingAnswers } from '@/src/domain/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import styles from './Screens.module.css';

/**
 * As cinco perguntas do onboarding.
 *
 * Os valores são exatamente os aceitos por `OnboardingAnswers`; qualquer desvio
 * aqui reaparece como 400 em `/api/parakletos`. As respostas cruas nunca são
 * persistidas nem enviadas ao provedor — `completeOnboarding` guarda apenas o
 * perfil derivado.
 */
const QUESTIONS = [
  {
    field: 'ageBand',
    label: 'Primeiro passo',
    prompt: 'Em que fase da caminhada você está?',
    hint: 'Só usamos a faixa etária para ajustar linguagem e ritmo.',
    options: [
      { value: '6-9', title: 'Entre 6 e 9', hint: 'Uma jornada direta e bem visual' },
      { value: '10-13', title: 'Entre 10 e 13', hint: 'Desafios com mais contexto' },
      { value: '14-17', title: 'Entre 14 e 17', hint: 'Narrativa e decisões' },
      { value: '18+', title: '18 ou mais', hint: 'Reflexões um pouco mais profundas' },
    ],
  },
  {
    field: 'christianHome',
    label: 'Histórias ao redor',
    prompt: 'Essas histórias já fizeram parte da sua casa?',
    hint: 'Não existe resposta melhor. Isso só evita explicações rasas ou complicadas demais.',
    options: [
      { value: 'yes', title: 'Sim, desde cedo', hint: 'Alguns detalhes já são familiares' },
      { value: 'no', title: 'Quase nunca', hint: 'Quero descobrir sem pressupostos' },
      { value: 'prefer-not-to-say', title: 'Prefiro não dizer', hint: 'Seguimos por uma trilha equilibrada' },
    ],
  },
  {
    field: 'christianIdentity',
    label: 'Ponto de partida',
    prompt: 'Como você chega a esta jornada hoje?',
    hint: 'Esta resposta fica no seu dispositivo e nunca será usada para julgar sua fé.',
    options: [
      { value: 'yes', title: 'A fé cristã faz parte de mim', hint: 'Quero aprofundar conexões' },
      { value: 'exploring', title: 'Estou explorando', hint: 'Quero entender antes de concluir' },
      { value: 'no', title: 'Vim pela história', hint: 'Quero uma boa aventura' },
      { value: 'prefer-not-to-say', title: 'Prefiro não dizer', hint: 'Sem problema — seguimos juntos' },
    ],
  },
  {
    field: 'readingAffinity',
    label: 'Seu jeito de avançar',
    prompt: 'Você costuma gostar de ler?',
    hint: 'Sua resposta muda o formato dos desafios, não a profundidade do conteúdo.',
    options: [
      { value: 'yes', title: 'Sim, gosto de ler', hint: 'Contexto, escolhas e narrativa' },
      { value: 'sometimes', title: 'Às vezes', hint: 'Pistas, lógica e ação' },
      { value: 'no', title: 'Prefiro agir', hint: 'Ação, tempo e reflexo' },
    ],
  },
  {
    field: 'narrativePreference',
    label: 'A história que chama',
    prompt: 'Que tipo de jornada faz você esquecer do tempo?',
    hint: 'Vamos destacar histórias bíblicas com esse mesmo impulso narrativo.',
    options: [
      { value: 'heroes', title: 'Heróis improváveis', hint: 'Coragem quando ninguém aposta em você' },
      { value: 'adventure', title: 'Aventura e descoberta', hint: 'Caminhos, riscos e reviravoltas' },
      { value: 'romance', title: 'Laços e escolhas', hint: 'Lealdade, perda e reconciliação' },
    ],
  },
] as const;

export function CalibrationScreen({
  onComplete,
  onBack,
}: {
  onComplete: (answers: OnboardingAnswers) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<string, string>>>({});
  const question = QUESTIONS[index];

  function choose(value: string) {
    const next = { ...answers, [question.field]: value };
    setAnswers(next);

    if (index < QUESTIONS.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    onComplete(next as unknown as OnboardingAnswers);
  }

  function back() {
    if (index === 0) {
      onBack();
      return;
    }
    setIndex((current) => current - 1);
  }

  return (
    <section className={`${styles.screen} ${styles.calibration}`}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={back} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>{question.label}</Overline>
        </div>
      </header>

      <p className={styles.srOnly} aria-live="polite">
        Pergunta {index + 1} de {QUESTIONS.length}
      </p>
      <div className={styles.calibrationProgress} aria-hidden="true">
        {QUESTIONS.map((item, position) => (
          <i key={item.field} data-done={position <= index} />
        ))}
      </div>

      <div className={styles.dialogue}>
        <img src="/assets/characters/parakletos-guide.png" alt="Parakletos, o guia da jornada" />
        <div className={styles.dialogueBody}>
          <h2>{question.prompt}</h2>
          <p>{question.hint}</p>

          <div className={styles.choices}>
            {question.options.map((option) => (
              <button key={option.value} type="button" onClick={() => choose(option.value)}>
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.hint}</small>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <small className={styles.privacyNote}>{PARAKLETOS_IDENTITY_NOTICE}</small>
    </section>
  );
}
