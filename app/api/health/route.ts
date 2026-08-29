import { DEMO_SCHEMA_VERSION } from '@/src/domain/types';

export const runtime = 'edge';

export function GET() {
  return Response.json({
    service: 'peregrino',
    status: 'ok',
    schemaVersion: DEMO_SCHEMA_VERSION,
  });
}
