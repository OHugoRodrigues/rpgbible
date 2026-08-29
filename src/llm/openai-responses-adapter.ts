import { PARAKLETOS_SYSTEM_INSTRUCTIONS } from '@/src/llm/parakletos-policy';
import type {
  ParakletosDraft,
  ParakletosLlmAdapter,
  ResolvedParakletosContext,
} from '@/src/llm/parakletos-types';

export interface OpenAiResponsesAdapterOptions {
  apiKey: string;
  model: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

interface OpenAiResponseBody {
  output_text?: string;
  error?: { message?: string };
}

export class OpenAiResponsesAdapter implements ParakletosLlmAdapter {
  private readonly fetcher: typeof globalThis.fetch;
  private readonly timeoutMs: number;

  constructor(private readonly options: OpenAiResponsesAdapterOptions) {
    this.fetcher = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 8_000;
  }

  async generate(context: ResolvedParakletosContext): Promise<ParakletosDraft> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetcher(
        'https://api.openai.com/v1/responses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.options.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.options.model,
            store: false,
            max_output_tokens: 350,
            instructions: PARAKLETOS_SYSTEM_INSTRUCTIONS,
            input: [
              {
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: JSON.stringify({
                      task: 'Ofereça contexto e uma pergunta de reflexão para a etapa atual.',
                      stage: context.stageName,
                      approvedSummary: context.approvedSummary,
                      approvedReferences: context.approvedReferences,
                      audienceTone: context.profile.audienceTone,
                      biblicalLiteracy: context.profile.biblicalLiteracy,
                      experienceMode: context.profile.experienceMode,
                      narrativePreference: context.profile.narrativePreference,
                      learnerQuestion: context.question ?? null,
                    }),
                  },
                ],
              },
            ],
            text: {
              format: {
                type: 'json_schema',
                name: 'parakletos_guidance',
                strict: true,
                schema: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    message: { type: 'string' },
                    biblicalReference: {
                      type: 'string',
                      enum: [...context.approvedReferences],
                    },
                    reflectionQuestion: { type: 'string' },
                  },
                  required: [
                    'message',
                    'biblicalReference',
                    'reflectionQuestion',
                  ],
                },
              },
            },
          }),
          signal: controller.signal,
        },
      );
      const body = (await response.json()) as OpenAiResponseBody;
      if (!response.ok || !body.output_text)
        throw new Error(
          body.error?.message ??
            `OpenAI request failed with ${response.status}`,
        );
      return JSON.parse(body.output_text) as ParakletosDraft;
    } finally {
      clearTimeout(timeout);
    }
  }
}
