import type { AdaptiveJourneyStageId } from '@/src/domain/types';
import type {
  ParakletosDraft,
  ParakletosLlmAdapter,
  ResolvedParakletosContext,
} from '@/src/llm/parakletos-types';

const FALLBACKS: Record<
  AdaptiveJourneyStageId,
  Omit<ParakletosDraft, 'biblicalReference'>
> = {
  chosen: {
    message:
      'Samuel precisou olhar além das primeiras impressões. Nesta etapa, observe como caráter e propósito não cabem apenas na aparência.',
    reflectionQuestion:
      'Que qualidade importante pode passar despercebida quando julgamos rápido demais?',
  },
  shepherd: {
    message:
      'Antes do grande confronto, Davi viveu um longo período de cuidado e responsabilidade. O cotidiano também pode ser lugar de preparo.',
    reflectionQuestion:
      'Qual responsabilidade pequena tem ajudado você a crescer?',
  },
  trial: {
    message:
      'Davi reconheceu o perigo, recusou recursos que não dominava e avançou com aquilo para o qual havia se preparado.',
    reflectionQuestion:
      'Como coragem, preparo e confiança aparecem juntos nesta cena?',
  },
  king: {
    message:
      'A liderança de Davi ampliou suas responsabilidades. A narrativa convida a pensar em liderança como serviço, escolhas e consequências.',
    reflectionQuestion:
      'Como uma pessoa pode usar autoridade para servir melhor?',
  },
  legacy: {
    message:
      'O legado de Davi reúne vitórias, falhas e aprendizados. A Bíblia não precisa esconder a complexidade de seus personagens para ensinar.',
    reflectionQuestion:
      'Que aprendizado você levaria desta jornada para uma decisão futura?',
  },
};

export class FallbackParakletosAdapter implements ParakletosLlmAdapter {
  async generate(context: ResolvedParakletosContext): Promise<ParakletosDraft> {
    return {
      ...FALLBACKS[context.stageId],
      biblicalReference: context.approvedReferences[0],
    };
  }
}
