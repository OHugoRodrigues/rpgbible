import type { PersonalizationProfile } from '@/src/domain/types';
import { OpenAiResponsesAdapter } from '@/src/llm/openai-responses-adapter';
import { PARAKLETOS_IDENTITY_NOTICE } from '@/src/llm/parakletos-policy';
import { ParakletosService } from '@/src/llm/parakletos-service';
import type {
  ParakletosLlmAdapter,
  ParakletosRequest,
} from '@/src/llm/parakletos-types';
import { describe, expect, it, vi } from 'vitest';

const profile: PersonalizationProfile = {
  audienceTone: 'teen',
  biblicalLiteracy: 'developing',
  experienceMode: 'balanced',
  narrativePreference: 'heroes',
};
const request: ParakletosRequest = { stageId: 'trial', profile };

describe('Parakletos service', () => {
  it('is always identified as an educational character, never as a divine voice', async () => {
    const message = await new ParakletosService().advise(request);
    expect(message.source).toBe('fallback');
    expect(message.role).toBe('educational-guide');
    expect(message.identityNotice).toBe(PARAKLETOS_IDENTITY_NOTICE);
    expect(message.biblicalReference).toBe('1 Samuel 17:1-51');
  });

  it('accepts safe structured LLM output grounded in an approved reference', async () => {
    const adapter: ParakletosLlmAdapter = {
      generate: vi.fn().mockResolvedValue({
        message: 'A cena contrasta a força aparente com uma coragem preparada.',
        biblicalReference: '1 Samuel 17:1-51',
        reflectionQuestion: 'O que ajuda alguém a agir mesmo sentindo medo?',
      }),
    };
    const message = await new ParakletosService(adapter).advise(request);
    expect(message.source).toBe('llm');
  });

  it.each([
    {
      message: 'Deus me disse que você vencerá seu gigante.',
      biblicalReference: '1 Samuel 17:1-51',
      reflectionQuestion: 'Você acredita?',
    },
    {
      message: 'Uma reflexão genérica.',
      biblicalReference: 'Referência inventada 1:1',
      reflectionQuestion: 'O que você pensa?',
    },
  ])('falls back when model output violates policy', async (unsafeDraft) => {
    const adapter: ParakletosLlmAdapter = {
      generate: vi.fn().mockResolvedValue(unsafeDraft),
    };
    const message = await new ParakletosService(adapter).advise(request);
    expect(message.source).toBe('fallback');
    expect(message.message).not.toContain(unsafeDraft.message);
  });
});

describe('OpenAI Responses adapter', () => {
  it('uses server-side structured output with storage disabled', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            message: 'Contexto aprovado.',
            biblicalReference: '1 Samuel 17:1-51',
            reflectionQuestion: 'O que você observou?',
          }),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const adapter = new OpenAiResponsesAdapter({
      apiKey: 'test-key',
      model: 'test-model',
      fetch: fetcher,
    });
    await adapter.generate({
      ...request,
      stageName: 'A Provação',
      approvedSummary: 'Resumo aprovado.',
      approvedReferences: ['1 Samuel 17:1-51'],
    });

    const [, init] = fetcher.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body.store).toBe(false);
    expect(body.text.format.type).toBe('json_schema');
    expect(body.text.format.strict).toBe(true);
    expect(JSON.stringify(body)).not.toContain('christianIdentity');
    expect(init.headers.Authorization).toBe('Bearer test-key');
  });
});
