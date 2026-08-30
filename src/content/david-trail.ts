import type {
  AdaptiveJourneyStageId,
  DavidMissionPhaseId,
} from '@/src/domain/types';

export interface DavidTrailLine {
  speaker: 'Parakletos' | 'Jessé' | 'Golias' | 'Saul';
  text: string;
}

export interface DavidTrailPhase {
  id: DavidMissionPhaseId;
  order: number;
  title: string;
  prompt: string;
  biblicalReferences: readonly string[];
  parakletosStage: AdaptiveJourneyStageId;
}

export const DAVID_TRAIL: readonly DavidTrailPhase[] = [
  {
    id: 'supplies-merge',
    order: 1,
    title: 'A Fornalha e o Queijo',
    prompt:
      'Arraste e combine ingredientes básicos no tabuleiro para fabricar os suprimentos exatos da missão!',
    biblicalReferences: ['1 Samuel 17:17-20'],
    parakletosStage: 'trial',
  },
  {
    id: 'brook-skyfall',
    order: 2,
    title: 'Catador do Riacho',
    prompt:
      'Desça até o leito do riacho. Você precisa das pedras perfeitas para a sua funda!',
    biblicalReferences: ['1 Samuel 17:40'],
    parakletosStage: 'trial',
  },
  {
    id: 'david-goliath',
    order: 3,
    title: 'Davi e Golias',
    prompt: 'Toque quando o indicador estiver no centro!',
    biblicalReferences: ['1 Samuel 17:23-49'],
    parakletosStage: 'trial',
  },
  {
    id: 'parakletos-challenge',
    order: 4,
    title: 'Desafio do Parakletos',
    prompt: 'Mostre que acompanhou a missão e organize a história de Davi.',
    biblicalReferences: ['1 Samuel 17:17-49'],
    parakletosStage: 'trial',
  },
] as const;

export const DAVID_TRAIL_BY_PHASE = Object.fromEntries(
  DAVID_TRAIL.map((phase) => [phase.id, phase]),
) as Record<DavidMissionPhaseId, DavidTrailPhase>;

export const DAVID_TRAIL_TITLES = Object.fromEntries(
  DAVID_TRAIL.map((phase) => [phase.id, phase.title]),
) as Record<DavidMissionPhaseId, string>;

export const DAVID_TRAIL_INTRO: Record<
  DavidMissionPhaseId,
  readonly DavidTrailLine[]
> = {
  'supplies-merge': [
    {
      speaker: 'Jessé',
      text: 'Davi, leve estes alimentos aos seus irmãos no acampamento.',
    },
    {
      speaker: 'Jessé',
      text: 'Entregue as porções ao comandante e traga notícias deles.',
    },
    {
      speaker: 'Parakletos',
      text: 'Prepare 3 pães e 3 queijos antes de partir.',
    },
  ],
  'brook-skyfall': [
    {
      speaker: 'Parakletos',
      text: 'Davi chegou ao acampamento, mas os soldados estão assustados.',
    },
    {
      speaker: 'Parakletos',
      text: 'Vá ao riacho e busque 5 pedras lisas para a funda.',
    },
  ],
  'david-goliath': [],
  'parakletos-challenge': [
    {
      speaker: 'Parakletos',
      text: 'Você acompanhou Davi até Golias. Agora mostre o que aprendeu!',
    },
  ],
};

export const DAVID_TRAIL_OUTRO: Record<
  DavidMissionPhaseId,
  readonly DavidTrailLine[]
> = {
  'supplies-merge': [],
  'brook-skyfall': [],
  'david-goliath': [
    {
      speaker: 'Parakletos',
      text: 'O gigante caiu! Davi venceu porque confiou em Deus.',
    },
  ],
  'parakletos-challenge': [
    {
      speaker: 'Parakletos',
      text: 'Você conseguiu! Davi não era o mais forte, mas confiou em Deus.',
    },
  ],
};
