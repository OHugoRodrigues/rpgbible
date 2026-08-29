export const runtime = 'edge';

export function GET() {
  return Response.json({ service: 'peregrino', status: 'ok', schemaVersion: 1 });
}
