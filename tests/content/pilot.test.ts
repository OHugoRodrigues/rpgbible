import {
  DAVID_CHAPTERS,
  DISCOVERY_HOTSPOTS,
  PILOT_JOURNEYS,
  PREPARATION_ITEMS,
  QUIZ_QUESTIONS,
} from '@/src/content/pilot';
import { describe, expect, it } from 'vitest';

describe('conteúdo do piloto', () => {
  it('expõe as seis jornadas com apenas Davi disponível', () => {
    expect(PILOT_JOURNEYS).toHaveLength(6);
    const available = PILOT_JOURNEYS.filter((journey) => journey.available);
    expect(available.map((journey) => journey.id)).toEqual(['davi']);
    for (const journey of PILOT_JOURNEYS) expect(journey.theme.trim()).not.toBe('');
  });

  it('expõe os cinco capítulos com apenas "A Provação" jogável', () => {
    expect(DAVID_CHAPTERS).toHaveLength(5);
    expect(DAVID_CHAPTERS.filter((chapter) => chapter.playable).map((chapter) => chapter.id)).toEqual([
      'provacao',
    ]);
    expect(DAVID_CHAPTERS.map((chapter) => chapter.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it('dá referência bíblica a cada elemento de descoberta', () => {
    expect(DISCOVERY_HOTSPOTS).toHaveLength(4);
    for (const hotspot of DISCOVERY_HOTSPOTS) {
      expect(hotspot.biblicalReference).toMatch(/^1 Samuel/);
      expect(hotspot.copy.trim()).not.toBe('');
    }
  });

  it('mistura itens corretos e distratores na preparação', () => {
    const correct = PREPARATION_ITEMS.filter((item) => item.correct);
    expect(correct.map((item) => item.id)).toEqual(['staff', 'sling', 'stones']);
    expect(PREPARATION_ITEMS.length - correct.length).toBeGreaterThan(0);
  });

  it('mantém cada pergunta do quiz com explicação e referência', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(1);
    for (const question of QUIZ_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(question.correctOption).toBeGreaterThanOrEqual(0);
      expect(question.correctOption).toBeLessThan(question.options.length);
      expect(question.explanation.trim()).not.toBe('');
      expect(question.biblicalReference.trim()).not.toBe('');
    }
  });
});
