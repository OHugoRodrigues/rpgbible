import type {
  AdaptiveJourneyStage,
  StoryRecommendation,
} from '@/src/domain/types';

export const DAVID_ADAPTIVE_STAGES: readonly AdaptiveJourneyStage[] = [
  {
    id: 'chosen',
    order: 1,
    name: 'O Escolhido',
    summary:
      'Samuel visita a família de Jessé e aprende a não julgar apenas pela aparência.',
    biblicalReferences: ['1 Samuel 16:1-13'],
    variants: {
      textual: {
        mode: 'textual',
        title: 'Entrelinhas em Belém',
        mechanic: 'Leitura guiada com escolhas de interpretação',
        learningGoal: 'Distinguir aparência de caráter',
      },
      gamified: {
        mode: 'gamified',
        title: 'Quem será o escolhido?',
        mechanic: 'Investigar pistas e eliminar conclusões apressadas',
        learningGoal: 'Distinguir aparência de caráter',
      },
      balanced: {
        mode: 'balanced',
        title: 'A casa de Jessé',
        mechanic: 'Hotspots narrativos seguidos de uma decisão',
        learningGoal: 'Distinguir aparência de caráter',
      },
    },
  },
  {
    id: 'shepherd',
    order: 2,
    name: 'O Pastor',
    summary: 'O cuidado cotidiano prepara Davi para responsabilidades maiores.',
    biblicalReferences: ['1 Samuel 16:11-23', '1 Samuel 17:34-37'],
    variants: {
      textual: {
        mode: 'textual',
        title: 'Diário do pastor',
        mechanic: 'Narrativa episódica com perguntas de reflexão',
        learningGoal: 'Reconhecer preparo e fidelidade no cotidiano',
      },
      gamified: {
        mode: 'gamified',
        title: 'Proteja o rebanho',
        mechanic: 'Desafios rápidos de atenção, ritmo e decisão',
        learningGoal: 'Reconhecer preparo e fidelidade no cotidiano',
      },
      balanced: {
        mode: 'balanced',
        title: 'Um dia no campo',
        mechanic: 'Exploração curta alternada com decisões práticas',
        learningGoal: 'Reconhecer preparo e fidelidade no cotidiano',
      },
    },
  },
  {
    id: 'trial',
    order: 3,
    name: 'A Provação',
    summary:
      'Davi enfrenta Golias usando recursos conhecidos e confiança em Deus.',
    biblicalReferences: ['1 Samuel 17:1-51'],
    variants: {
      textual: {
        mode: 'textual',
        title: 'Vozes no vale',
        mechanic: 'Diálogos, contexto histórico e escolhas argumentativas',
        learningGoal: 'Relacionar fé, coragem e preparo',
      },
      gamified: {
        mode: 'gamified',
        title: 'O desafio de Golias',
        mechanic: 'Preparação de itens, lançamento em AR e feedback imediato',
        learningGoal: 'Relacionar fé, coragem e preparo',
      },
      balanced: {
        mode: 'balanced',
        title: 'Coragem no vale',
        mechanic: 'Hotspots de contexto, preparação e confronto em AR',
        learningGoal: 'Relacionar fé, coragem e preparo',
      },
    },
  },
  {
    id: 'king',
    order: 4,
    name: 'O Rei',
    summary:
      'Davi assume a liderança e precisa lidar com responsabilidade e escolhas.',
    biblicalReferences: ['2 Samuel 5:1-12'],
    variants: {
      textual: {
        mode: 'textual',
        title: 'O peso da coroa',
        mechanic: 'Estudo de caso narrativo com dilemas de liderança',
        learningGoal:
          'Refletir sobre liderança como serviço e responsabilidade',
      },
      gamified: {
        mode: 'gamified',
        title: 'Decisões do reino',
        mechanic: 'Sequência de decisões com consequências visíveis',
        learningGoal:
          'Refletir sobre liderança como serviço e responsabilidade',
      },
      balanced: {
        mode: 'balanced',
        title: 'Construindo o reino',
        mechanic: 'Mapa de decisões intercalado com pequenos textos',
        learningGoal:
          'Refletir sobre liderança como serviço e responsabilidade',
      },
    },
  },
  {
    id: 'legacy',
    order: 5,
    name: 'O Legado',
    summary:
      'A trajetória de Davi convida a observar acertos, falhas, arrependimento e legado.',
    biblicalReferences: ['1 Reis 2:1-4'],
    variants: {
      textual: {
        mode: 'textual',
        title: 'Cartas para o futuro',
        mechanic: 'Retrospectiva narrativa e registro de aprendizado',
        learningGoal: 'Compreender legado sem idealizar o personagem',
      },
      gamified: {
        mode: 'gamified',
        title: 'Constelação do legado',
        mechanic: 'Conectar eventos, decisões e consequências',
        learningGoal: 'Compreender legado sem idealizar o personagem',
      },
      balanced: {
        mode: 'balanced',
        title: 'Marcas de uma jornada',
        mechanic: 'Linha do tempo interativa com reflexão final',
        learningGoal: 'Compreender legado sem idealizar o personagem',
      },
    },
  },
] as const;

export const STORY_RECOMMENDATIONS: readonly StoryRecommendation[] = [
  {
    id: 'ruth-boaz',
    title: 'Rute e Boaz',
    context: 'romance',
    summary:
      'Lealdade, cuidado e recomeço em uma história de família e redenção.',
    biblicalReferences: ['Rute 1-4'],
  },
  {
    id: 'isaac-rebekah',
    title: 'Isaque e Rebeca',
    context: 'romance',
    summary: 'Família, compromisso e providência na formação de uma nova casa.',
    biblicalReferences: ['Gênesis 24'],
  },
  {
    id: 'jacob-rachel',
    title: 'Jacó e Raquel',
    context: 'romance',
    summary:
      'Afeto, espera e relações familiares marcadas por escolhas complexas.',
    biblicalReferences: ['Gênesis 29-30'],
  },
  {
    id: 'esther',
    title: 'Ester',
    context: 'heroes',
    summary: 'Coragem responsável diante de uma ameaça contra seu povo.',
    biblicalReferences: ['Ester 2-8'],
  },
  {
    id: 'daniel',
    title: 'Daniel',
    context: 'heroes',
    summary: 'Fidelidade e integridade em um ambiente de grande pressão.',
    biblicalReferences: ['Daniel 1-6'],
  },
  {
    id: 'gideon',
    title: 'Gideão',
    context: 'heroes',
    summary: 'Uma liderança improvável que aprende a agir apesar do medo.',
    biblicalReferences: ['Juízes 6-8'],
  },
  {
    id: 'exodus',
    title: 'O Êxodo',
    context: 'adventure',
    summary: 'Libertação, travessia e formação de um povo no deserto.',
    biblicalReferences: ['Êxodo 3-20'],
  },
  {
    id: 'paul-voyage',
    title: 'A viagem de Paulo',
    context: 'adventure',
    summary:
      'Uma jornada marítima marcada por perigo, coragem e cuidado com os companheiros.',
    biblicalReferences: ['Atos 27-28'],
  },
  {
    id: 'joshua',
    title: 'Josué',
    context: 'adventure',
    summary: 'Travessia, desafios e liderança na entrada em uma nova terra.',
    biblicalReferences: ['Josué 1-6'],
  },
] as const;
