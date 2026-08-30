import type { Chapter, Journey } from '@/src/domain/types';

export const PILOT_JOURNEYS: readonly Journey[] = [
  { id: 'davi', name: 'Davi', theme: 'Fé e Coragem', available: true },
  { id: 'moises', name: 'Moisés', theme: 'Libertação e Propósito', available: false },
  { id: 'josue', name: 'Josué', theme: 'Coragem e Conquista', available: false },
  { id: 'abraao', name: 'Abraão', theme: 'Fé e Promessa', available: false },
  { id: 'jaco', name: 'Jacó', theme: 'Transformação', available: false },
  { id: 'jesus', name: 'Jesus', theme: 'O Caminho', available: false },
] as const;

export const DAVID_CHAPTERS: readonly Chapter[] = [
  { id: 'escolhido', order: 1, name: 'O Escolhido', summary: 'Samuel procura o futuro rei.', playable: false },
  { id: 'pastor', order: 2, name: 'O Pastor', summary: 'Davi aprende enquanto cuida das ovelhas.', playable: false },
  {
    id: 'provacao',
    order: 3,
    name: 'Trilha 1 — O Guerreiro',
    summary:
      'Da missão de Jessé ao desafio final do Parakletos, em quatro fases.',
    playable: true,
  },
  { id: 'rei', order: 4, name: 'O Rei', summary: 'Ascensão, liderança e decisões.', playable: false },
  { id: 'legado', order: 5, name: 'O Legado', summary: 'Consequências e impacto de sua história.', playable: false },
] as const;

export const DISCOVERY_HOTSPOTS = [
  { id: 'israel', label: 'Israel', copy: 'O exército de Israel estava diante de uma ameaça que parecia impossível.', biblicalReference: '1 Samuel 17:2-11' },
  { id: 'philistines', label: 'Filisteus', copy: 'Os filisteus ocupavam o lado oposto do vale e apresentavam seu campeão.', biblicalReference: '1 Samuel 17:1-4' },
  { id: 'goliath', label: 'Golias', copy: 'Golias desafiava Israel e confiava em sua força e experiência de guerra.', biblicalReference: '1 Samuel 17:4-10' },
  { id: 'valley', label: 'Vale', copy: 'O vale separava os dois exércitos e se tornou o cenário do confronto.', biblicalReference: '1 Samuel 17:3' },
] as const;

export const PREPARATION_ITEMS = [
  { id: 'staff', label: 'Cajado', correct: true },
  { id: 'sling', label: 'Funda', correct: true },
  { id: 'stones', label: 'Cinco pedras lisas', correct: true },
  { id: 'armor', label: 'Armadura', correct: false },
  { id: 'sword', label: 'Espada', correct: false },
  { id: 'shield', label: 'Escudo', correct: false },
] as const;

export const QUIZ_QUESTIONS = [
  {
    id: 'tools',
    prompt: 'Quais recursos Davi levou para o confronto?',
    options: ['Armadura e espada', 'Cajado, funda e cinco pedras', 'Escudo e lança'],
    correctOption: 1,
    explanation: 'Davi escolheu ferramentas que já conhecia e recusou a armadura que não havia experimentado.',
    biblicalReference: '1 Samuel 17:38-40',
  },
  {
    id: 'armor',
    prompt: 'Por que Davi não usou a armadura de Saul?',
    options: ['Era pesada demais para transportar', 'Ele ainda não estava acostumado a ela', 'Golias também não usava armadura'],
    correctOption: 1,
    explanation: 'Davi decidiu não depender de algo que não havia testado e seguiu preparado com o que dominava.',
    biblicalReference: '1 Samuel 17:38-40',
  },
  {
    id: 'message',
    prompt: 'Qual mensagem central orienta esta etapa da jornada?',
    options: ['A aparência define o resultado', 'Coragem e confiança em Deus superam o medo', 'A força física sempre vence'],
    correctOption: 1,
    explanation: 'A narrativa contrasta a confiança na força aparente com a fé corajosa de Davi.',
    biblicalReference: '1 Samuel 17:45-47',
  },
] as const;
