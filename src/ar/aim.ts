/** Centro da zona dourada da barra de mira, em porcentagem. */
export const STONE_AIM_TARGET = 68;
export const STONE_AIM_TOLERANCE = 10;
export const STONE_AIM_STEP = 3;

export function isStoneAimHit(aim: number): boolean {
  return Math.abs(aim - STONE_AIM_TARGET) <= STONE_AIM_TOLERANCE;
}

export function nextStoneAim(aim: number, direction: 1 | -1): {
  aim: number;
  direction: 1 | -1;
} {
  const next = aim + direction * STONE_AIM_STEP;
  if (next >= 98) return { aim: 98, direction: -1 };
  if (next <= 2) return { aim: 2, direction: 1 };
  return { aim: next, direction };
}
