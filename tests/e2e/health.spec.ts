import { createInitialDavidMissionState } from '@/src/application/david-mission-progress';
import { createInitialDemoState } from '@/src/application/demo-engine';
import { DEMO_STORAGE_KEY } from '@/src/application/store';
import {
  DAVID_MISSION_PHASES,
  DEMO_SCHEMA_VERSION,
  type DavidMissionPhaseId,
} from '@/src/domain/types';
import { expect, test, type Page } from '@playwright/test';

const now = '2026-08-29T12:00:00.000Z';

async function openPersistedPhase(
  page: Page,
  phase: DavidMissionPhaseId,
  index: number,
  phaseData: Record<string, unknown> = {},
) {
  const completedPhases = DAVID_MISSION_PHASES.slice(0, index);
  const phaseResults = Object.fromEntries(
    completedPhases.map((completedPhase) => [
      completedPhase,
      {
        phase: completedPhase,
        completed: true,
        points: 25,
        completedAt: now,
      },
    ]),
  );
  const state = {
    ...createInitialDemoState(now),
    currentStep: 'david-mission' as const,
    davidMission: {
      ...createInitialDavidMissionState(),
      currentPhase: phase,
      completedPhases,
      phaseResults,
      phaseData,
    },
  };
  await page.goto('/');
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    {
      key: DEMO_STORAGE_KEY,
      value: JSON.stringify({ state, version: DEMO_SCHEMA_VERSION }),
    },
  );
  await page.reload();
}

async function finishDialogue(page: Page, maximumClicks = 12) {
  for (let click = 0; click < maximumClicks; click += 1) {
    const advance = page.getByRole('button', {
      name: /Mostrar todo o diálogo|Avançar diálogo/,
    });
    if ((await advance.count()) === 0) return;
    await advance.first().click();
  }
}

test('reports schema v4 infrastructure health', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    service: 'peregrino',
    status: 'ok',
    schemaVersion: 4,
  });
});

test('opens Parakletos after skipping calibration', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Iniciar a jornada/ }).click();
  await page.getByRole('button', { name: 'Pular personalização' }).click();
  await page.getByRole('button', { name: /Falar com Parakletos/ }).click();
  await expect(page.getByRole('heading', { name: 'Parakletos' })).toBeVisible();
});

test('restores every checkpoint in the four-phase trail', async ({ page }) => {
  for (const [index, phase] of DAVID_MISSION_PHASES.entries()) {
    await openPersistedPhase(page, phase, index);
    await expect(
      page.getByText(
        `O Guerreiro · Fase ${index + 1} de ${DAVID_MISSION_PHASES.length}`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label="Diálogo de Davi"]'),
    ).toHaveCount(0);
  }
});

test('restores lives and board progress in the merge phase', async ({
  page,
}) => {
  const board = Array.from({ length: 25 }, (_, index) =>
    index === 0 ? 'wheat' : index === 1 ? 'milk' : null,
  );
  await openPersistedPhase(page, 'supplies-merge', 0, {
    'supplies-merge': {
      board,
      moves: 12,
      bakedBread: 1,
      thickCheese: 1,
      lives: 2,
    },
  });

  await finishDialogue(page);

  await expect(page.locator('#supply-cell-0')).toHaveAttribute(
    'data-resource',
    'wheat',
  );
  await expect(page.getByText('🍞 1/3')).toBeVisible();
  await expect(page.getByText('🧀 1/3')).toBeVisible();
  await expect(page.getByText(/2.*3/)).toBeVisible();
});

test('finishes the Parakletos challenge with the new achievement', async ({
  page,
}) => {
  await openPersistedPhase(page, 'parakletos-challenge', 3, {
    'parakletos-challenge': {
      questionIndex: 3,
      livesRemaining: 2,
      status: 'playing',
      selectedMission: ['food', 'news'],
      storyOrder: ['jesse', 'supplies', 'brook', 'goliath'],
    },
  });
  await finishDialogue(page);
  await page.getByRole('button', { name: 'CONFIRMAR ORDEM' }).click();
  await page.getByRole('button', { name: 'CONTINUAR' }).click();
  await finishDialogue(page);

  await expect(page.getByText('CORAGEM PARA CONFIAR')).toBeVisible();
  await expect(page.getByText('❤️ Vidas restantes: 2/3')).toBeVisible();
});
