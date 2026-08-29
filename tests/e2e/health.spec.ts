import { DEMO_SCHEMA_VERSION } from '@/src/domain/types';
import { expect, test } from '@playwright/test';

test('reports the infrastructure health', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    service: 'peregrino',
    status: 'ok',
    schemaVersion: DEMO_SCHEMA_VERSION,
  });
});
