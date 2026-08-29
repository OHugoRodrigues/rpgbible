import { DAVID_ADAPTIVE_STAGES } from '@/src/content/adaptive-journeys';
import { FallbackParakletosAdapter } from '@/src/llm/fallback-parakletos-adapter';
import {
  isSafeParakletosDraft,
  PARAKLETOS_IDENTITY_NOTICE,
} from '@/src/llm/parakletos-policy';
import type {
  ParakletosLlmAdapter,
  ParakletosMessage,
  ParakletosRequest,
  ResolvedParakletosContext,
} from '@/src/llm/parakletos-types';

export class ParakletosService {
  private readonly fallback = new FallbackParakletosAdapter();

  constructor(private readonly primary?: ParakletosLlmAdapter) {}

  async advise(request: ParakletosRequest): Promise<ParakletosMessage> {
    const stage = DAVID_ADAPTIVE_STAGES.find(
      (candidate) => candidate.id === request.stageId,
    );
    if (!stage)
      throw new Error(`Unknown adaptive journey stage: ${request.stageId}`);
    const context: ResolvedParakletosContext = {
      ...request,
      stageName: stage.name,
      approvedSummary: stage.summary,
      approvedReferences: stage.biblicalReferences,
    };

    if (this.primary) {
      try {
        const draft = await this.primary.generate(context);
        if (isSafeParakletosDraft(draft, context)) return wrap(draft, 'llm');
      } catch {
        // The guide remains available during timeouts, quota failures and malformed model output.
      }
    }

    return wrap(await this.fallback.generate(context), 'fallback');
  }
}

function wrap(
  draft: Awaited<ReturnType<ParakletosLlmAdapter['generate']>>,
  source: ParakletosMessage['source'],
): ParakletosMessage {
  return {
    ...draft,
    character: 'parakletos',
    role: 'educational-guide',
    identityNotice: PARAKLETOS_IDENTITY_NOTICE,
    source,
  };
}
