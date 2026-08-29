import type { MinigameDefinition } from '@/src/games/types';

export const DAVID_MINIGAMES: readonly MinigameDefinition[] = [
  {
    id: 'chosen',
    historicalContext:
      'Samuel vai a Belém e observa os filhos de Jessé antes de Davi ser chamado do campo. A narrativa confronta julgamentos baseados apenas na aparência.',
    biblicalReferences: ['1 Samuel 16:1-13'],
    provocativeQuestion:
      'Quantas decisões injustas começam quando confundimos presença com caráter?',
    variants: {
      textual: {
        mode: 'textual',
        kind: 'context-choice',
        title: 'Além da aparência',
        instructions:
          'Leia as pistas e escolha o critério enfatizado pela narrativa.',
        prompt: 'O contraste central aponta para aparência ou caráter?',
        timeLimitSeconds: 120,
        acceptedAnswers: ['caráter', 'carater'],
        choices: ['aparência', 'caráter', 'idade'],
      },
      gamified: {
        mode: 'gamified',
        kind: 'word-grid',
        title: 'Palavra escondida',
        instructions:
          'Descubra a palavra de sete letras usando as pistas de posição.',
        prompt: 'Complete o conceito associado ao olhar para o interior.',
        timeLimitSeconds: 75,
        acceptedAnswers: ['coração', 'coracao'],
        letterBank: 'CORACAO',
      },
      balanced: {
        mode: 'balanced',
        kind: 'evidence-chain',
        title: 'Pistas em Belém',
        instructions: 'Ligue a pista narrativa à conclusão mais consistente.',
        prompt: 'Qual pista desmonta a primeira impressão de Samuel?',
        timeLimitSeconds: 95,
        acceptedAnswers: ['davi estava no campo', 'campo'],
        choices: [
          'Eliabe era alto',
          'Davi estava no campo',
          'Jessé tinha muitos filhos',
        ],
      },
    },
    recoveryReading: {
      biblicalReference: '1 Samuel 16:6-13',
      readingPrompt:
        'Observe a mudança entre a primeira impressão de Samuel e a escolha final.',
      checkQuestion: 'Onde Davi estava quando Samuel examinou seus irmãos?',
      acceptedAnswers: ['campo', 'no campo'],
    },
    reviewStatus: 'po-review-required',
  },
  {
    id: 'shepherd',
    historicalContext:
      'Davi descreve o cuidado do rebanho como experiência concreta de responsabilidade e proteção antes do confronto no vale.',
    biblicalReferences: ['1 Samuel 17:34-37'],
    provocativeQuestion:
      'O que fazemos quando ninguém está olhando também nos prepara para decisões públicas?',
    variants: {
      textual: {
        mode: 'textual',
        kind: 'context-choice',
        title: 'Responsabilidade no campo',
        instructions: 'Interprete a experiência relatada por Davi.',
        prompt: 'O cuidado do rebanho revela principalmente qual qualidade?',
        timeLimitSeconds: 120,
        acceptedAnswers: ['responsabilidade'],
        choices: ['popularidade', 'responsabilidade', 'improviso'],
      },
      gamified: {
        mode: 'gamified',
        kind: 'anagram-race',
        title: 'Letras do cuidado',
        instructions: 'Reorganize as letras antes que o tempo termine.',
        prompt: 'Forme a ação central do trabalho de um pastor.',
        timeLimitSeconds: 60,
        acceptedAnswers: ['cuidar'],
        letterBank: 'CUIDAR',
      },
      balanced: {
        mode: 'balanced',
        kind: 'evidence-chain',
        title: 'Do campo ao vale',
        instructions: 'Conecte experiência, habilidade e decisão.',
        prompt: 'Qual experiência Davi usa como evidência de preparo?',
        timeLimitSeconds: 90,
        acceptedAnswers: [
          'proteção do rebanho',
          'protecao do rebanho',
          'rebanho',
        ],
        choices: [
          'A corte de Saul',
          'A proteção do rebanho',
          'O treinamento filisteu',
        ],
      },
    },
    recoveryReading: {
      biblicalReference: '1 Samuel 17:34-37',
      readingPrompt: 'Leia o argumento de Davi sobre experiências anteriores.',
      checkQuestion: 'Quem Davi afirma ter protegido?',
      acceptedAnswers: ['rebanho', 'ovelhas', 'o rebanho'],
    },
    reviewStatus: 'po-review-required',
  },
  {
    id: 'trial',
    historicalContext:
      'No vale de Elá, os exércitos ficam em lados opostos e Golias apresenta um desafio. Davi recusa equipamento que não havia testado e escolhe recursos que conhecia.',
    biblicalReferences: ['1 Samuel 17:1-51'],
    provocativeQuestion:
      'Coragem é ignorar o risco ou agir com clareza apesar dele?',
    variants: {
      textual: {
        mode: 'textual',
        kind: 'context-choice',
        title: 'Argumentos no vale',
        instructions:
          'Compare os discursos e identifique em que cada personagem deposita confiança.',
        prompt: 'Por que Davi recusa a armadura de Saul?',
        timeLimitSeconds: 135,
        acceptedAnswers: [
          'não estava acostumado',
          'nao estava acostumado',
          'não havia testado',
          'nao havia testado',
        ],
        choices: [
          'Era proibida',
          'Não estava acostumado',
          'Golias não usava armadura',
        ],
      },
      gamified: {
        mode: 'gamified',
        kind: 'anagram-race',
        title: 'Equipamento conhecido',
        instructions: 'Monte rapidamente o nome do recurso escolhido por Davi.',
        prompt: 'Reorganize as letras: A D N U F',
        timeLimitSeconds: 45,
        acceptedAnswers: ['funda'],
        letterBank: 'ADNUF',
      },
      balanced: {
        mode: 'balanced',
        kind: 'evidence-chain',
        title: 'Prepare o confronto',
        instructions:
          'Selecione o conjunto coerente com a passagem antes da etapa AR.',
        prompt: 'Quais itens acompanham Davi ao confronto?',
        timeLimitSeconds: 75,
        acceptedAnswers: [
          'cajado, funda e cinco pedras',
          'cajado funda cinco pedras',
        ],
        choices: [
          'Armadura, espada e escudo',
          'Cajado, funda e cinco pedras',
          'Lança, elmo e pedras',
        ],
      },
    },
    recoveryReading: {
      biblicalReference: '1 Samuel 17:38-40',
      readingPrompt:
        'Observe o teste da armadura e os itens escolhidos em seguida.',
      checkQuestion: 'Qual arma conhecida por Davi aparece na escolha final?',
      acceptedAnswers: ['funda', 'a funda'],
    },
    reviewStatus: 'po-review-required',
  },
  {
    id: 'king',
    historicalContext:
      'As tribos reconhecem Davi como rei, e a mudança de posição amplia sua responsabilidade sobre o povo.',
    biblicalReferences: ['2 Samuel 5:1-12'],
    provocativeQuestion:
      'Quando a influência cresce, o que impede que liderança vire apenas poder?',
    variants: {
      textual: {
        mode: 'textual',
        kind: 'context-choice',
        title: 'O peso da liderança',
        instructions:
          'Leia o acordo narrado e identifique a responsabilidade assumida.',
        prompt: 'A imagem de pastor aplicada ao rei enfatiza o quê?',
        timeLimitSeconds: 130,
        acceptedAnswers: ['cuidado do povo', 'cuidado', 'serviço', 'servico'],
        choices: ['Aparência pública', 'Cuidado do povo', 'Riqueza pessoal'],
      },
      gamified: {
        mode: 'gamified',
        kind: 'word-grid',
        title: 'Palavra da liderança',
        instructions: 'Descubra a palavra de sete letras pelas pistas.',
        prompt: 'Liderar com responsabilidade também significa...',
        timeLimitSeconds: 70,
        acceptedAnswers: ['serviço', 'servico'],
        letterBank: 'SERVICO',
      },
      balanced: {
        mode: 'balanced',
        kind: 'evidence-chain',
        title: 'Decisão de um rei',
        instructions:
          'Escolha a consequência coerente com uma liderança responsável.',
        prompt: 'Qual decisão melhor representa liderança como serviço?',
        timeLimitSeconds: 95,
        acceptedAnswers: ['proteger o povo', 'proteger'],
        choices: [
          'Proteger o povo',
          'Evitar toda responsabilidade',
          'Buscar apenas prestígio',
        ],
      },
    },
    recoveryReading: {
      biblicalReference: '2 Samuel 5:1-5',
      readingPrompt:
        'Observe como as tribos descrevem o papel esperado do rei.',
      checkQuestion: 'Qual imagem de cuidado é usada para a liderança?',
      acceptedAnswers: ['pastor', 'pastorear'],
    },
    reviewStatus: 'po-review-required',
  },
  {
    id: 'legacy',
    historicalContext:
      'As últimas orientações de Davi conectam escolhas presentes, responsabilidade e consequências futuras. Seu legado é apresentado sem apagar a complexidade da trajetória.',
    biblicalReferences: ['1 Reis 2:1-4'],
    provocativeQuestion:
      'Um legado deve ser medido apenas pelas vitórias ou também pelo que aprendemos com as falhas?',
    variants: {
      textual: {
        mode: 'textual',
        kind: 'context-choice',
        title: 'Conselho para o futuro',
        instructions:
          'Interprete a orientação final sem idealizar o personagem.',
        prompt: 'Qual relação a passagem estabelece?',
        timeLimitSeconds: 140,
        acceptedAnswers: ['escolhas e consequências', 'escolhas consequencias'],
        choices: [
          'Aparência e fama',
          'Escolhas e consequências',
          'Força e ausência de falhas',
        ],
      },
      gamified: {
        mode: 'gamified',
        kind: 'timeline',
        title: 'Marcas da jornada',
        instructions: 'Ordene os marcos: campo, vale, reino e legado.',
        prompt: 'Digite a sequência usando > entre os marcos.',
        timeLimitSeconds: 80,
        acceptedAnswers: ['campo>vale>reino>legado', 'campo vale reino legado'],
      },
      balanced: {
        mode: 'balanced',
        kind: 'timeline',
        title: 'Decisões e consequências',
        instructions: 'Organize os marcos e conecte uma aprendizagem final.',
        prompt: 'Qual é a ordem narrativa resumida?',
        timeLimitSeconds: 105,
        acceptedAnswers: ['campo>vale>reino>legado', 'campo vale reino legado'],
      },
    },
    recoveryReading: {
      biblicalReference: '1 Reis 2:1-4',
      readingPrompt:
        'Leia as orientações finais observando verbos de ação e consequências.',
      checkQuestion: 'A quem Davi dirige essas orientações?',
      acceptedAnswers: ['salomão', 'salomao'],
    },
    reviewStatus: 'po-review-required',
  },
] as const;

export function getDavidMinigame(
  id: MinigameDefinition['id'],
): MinigameDefinition {
  const definition = DAVID_MINIGAMES.find((candidate) => candidate.id === id);
  if (!definition) throw new Error(`Unknown David minigame: ${id}`);
  return definition;
}
