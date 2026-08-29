import type {
  AdaptiveJourneyStageId,
  PersonalizationProfile,
} from '@/src/domain/types';

export interface ParakletosRequest {
  stageId: AdaptiveJourneyStageId;
  profile: PersonalizationProfile;
  question?: string;
}

export interface ParakletosDraft {
  message: string;
  biblicalReference: string;
  reflectionQuestion: string;
}

export interface ParakletosMessage extends ParakletosDraft {
  character: 'parakletos';
  role: 'educational-guide';
  identityNotice: string;
  source: 'llm' | 'fallback';
}

export interface ResolvedParakletosContext extends ParakletosRequest {
  stageName: string;
  approvedSummary: string;
  approvedReferences: readonly string[];
}

export interface ParakletosLlmAdapter {
  generate(context: ResolvedParakletosContext): Promise<ParakletosDraft>;
}
