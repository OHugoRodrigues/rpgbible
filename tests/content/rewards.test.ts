import { COLLECTIBLES, EQUIPMENT, EQUIPMENT_SLOT_ORDER, findCollectible, findEquipment } from '@/src/content/rewards';
import { DAVID_CHAPTERS } from '@/src/content/pilot';
import { describe, expect, it } from 'vitest';

describe('catálogo de recompensas', () => {
  it('cobre os cinco colecionáveis da spec, um por capítulo de Davi', () => {
    expect(COLLECTIBLES).toHaveLength(5);
    const chapters = COLLECTIBLES.map((item) => item.chapter);
    expect(new Set(chapters).size).toBe(5);
    for (const chapter of chapters) {
      expect(DAVID_CHAPTERS.some((entry) => entry.id === chapter)).toBe(true);
    }
  });

  it('cobre os seis slots da Armadura de Deus sem repetir', () => {
    expect(EQUIPMENT).toHaveLength(EQUIPMENT_SLOT_ORDER.length);
    expect(new Set(EQUIPMENT.map((item) => item.slot))).toEqual(new Set(EQUIPMENT_SLOT_ORDER));
  });

  it('nunca apresenta um item sem referência bíblica', () => {
    for (const item of [...COLLECTIBLES, ...EQUIPMENT]) {
      expect(item.biblicalReference.trim()).not.toBe('');
      expect(item.description.trim()).not.toBe('');
      expect(item.asset.startsWith('/assets/')).toBe(true);
    }
  });

  it('resolve por id os dois itens que a missão concede', () => {
    expect(findCollectible('stone-of-david')?.name).toBe('Pedra de Davi');
    expect(findEquipment('shield-of-faith')?.slot).toBe('hand');
    expect(findCollectible('shield-of-faith')).toBeUndefined();
  });
});
