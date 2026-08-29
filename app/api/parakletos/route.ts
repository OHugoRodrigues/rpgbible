import { DAVID_ADAPTIVE_STAGES } from '@/src/content/adaptive-journeys';
import type { ParakletosRequest } from '@/src/llm/parakletos-types';
import { OpenAiResponsesAdapter } from '@/src/llm/openai-responses-adapter';
import { ParakletosService } from '@/src/llm/parakletos-service';

export const runtime = 'edge';

export async function POST(request: Request) {
  const parsed = parseRequest(await request.json().catch(() => null));
  if (!parsed)
    return Response.json(
      { error: 'Invalid Parakletos request.' },
      { status: 400 },
    );

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  const adapter =
    apiKey && model ? new OpenAiResponsesAdapter({ apiKey, model }) : undefined;
  const message = await new ParakletosService(adapter).advise(parsed);
  return Response.json(message, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

function parseRequest(value: unknown): ParakletosRequest | null {
  if (!isRecord(value) || !isRecord(value.profile)) return null;
  if (!DAVID_ADAPTIVE_STAGES.some((stage) => stage.id === value.stageId))
    return null;
  const profile = value.profile;
  if (
    !['child', 'preteen', 'teen', 'general'].includes(
      String(profile.audienceTone),
    )
  )
    return null;
  if (
    !['introductory', 'developing', 'familiar'].includes(
      String(profile.biblicalLiteracy),
    )
  )
    return null;
  if (
    !['textual', 'gamified', 'balanced'].includes(
      String(profile.experienceMode),
    )
  )
    return null;
  if (
    !['romance', 'heroes', 'adventure'].includes(
      String(profile.narrativePreference),
    )
  )
    return null;
  if (
    value.question !== undefined &&
    (typeof value.question !== 'string' || value.question.length > 280)
  )
    return null;
  return {
    stageId: value.stageId as ParakletosRequest['stageId'],
    profile: {
      audienceTone:
        profile.audienceTone as ParakletosRequest['profile']['audienceTone'],
      biblicalLiteracy:
        profile.biblicalLiteracy as ParakletosRequest['profile']['biblicalLiteracy'],
      experienceMode:
        profile.experienceMode as ParakletosRequest['profile']['experienceMode'],
      narrativePreference:
        profile.narrativePreference as ParakletosRequest['profile']['narrativePreference'],
    },
    question:
      typeof value.question === 'string' ? value.question.trim() : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
