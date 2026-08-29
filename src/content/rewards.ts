import type {
  ChapterId,
  CollectibleId,
  EquipmentId,
  EquipmentSlot,
} from '@/src/domain/types';

/**
 * Catálogo das duas economias da spec §6.
 *
 * Colecionáveis são conquista de final de capítulo ("Ganho no final da fase",
 * ref/10.png) e vivem na Estante de Jornadas. Equipamentos são a Armadura de
 * Deus (Efésios 6) e vivem no Inventário, subindo de qualidade por desempenho
 * e constância. As duas listas nunca se misturam na interface.
 *
 * `asset` aponta para um PNG opcional em `public/assets/items/`. Quando o
 * arquivo não existe, a interface desenha um ícone vetorial equivalente —
 * basta soltar a arte definitiva na pasta para substituí-lo.
 */

export interface CollectibleDefinition {
  id: CollectibleId;
  name: string;
  chapter: ChapterId;
  source: string;
  description: string;
  biblicalReference: string;
  asset: string;
}

export interface EquipmentDefinition {
  id: EquipmentId;
  slot: EquipmentSlot;
  slotName: string;
  name: string;
  description: string;
  biblicalReference: string;
  asset: string;
}

export const COLLECTIBLES: readonly CollectibleDefinition[] = [
  {
    id: 'scroll-of-samuel',
    name: 'Pergaminho de Samuel',
    chapter: 'escolhido',
    source: 'Davi — O Escolhido',
    description:
      'O registro da unção em Belém, quando a escolha contrariou toda expectativa de aparência.',
    biblicalReference: '1 Samuel 16:13',
    asset: '/assets/items/scroll.png',
  },
  {
    id: 'sling-of-david',
    name: 'Funda do Pastor',
    chapter: 'pastor',
    source: 'Davi — O Pastor',
    description:
      'A ferramenta que Davi dominava no campo, muito antes de existir uma plateia para vê-lo usá-la.',
    biblicalReference: '1 Samuel 17:34-37',
    asset: '/assets/items/sling.png',
  },
  {
    id: 'stone-of-david',
    name: 'Pedra de Davi',
    chapter: 'provacao',
    source: 'Davi — A Provação',
    description:
      'Uma das cinco pedras lisas recolhidas no ribeiro antes de descer ao vale de Elá.',
    biblicalReference: '1 Samuel 17:40',
    asset: '/assets/items/stones.png',
  },
  {
    id: 'crown-of-david',
    name: 'Coroa de Davi',
    chapter: 'rei',
    source: 'Davi — O Rei',
    description:
      'O reinado que começou com um pacto diante do Senhor, em Hebrom, e não com uma conquista.',
    biblicalReference: '2 Samuel 5:3',
    asset: '/assets/items/crown.png',
  },
  {
    id: 'harp-of-david',
    name: 'Harpa de Davi',
    chapter: 'legado',
    source: 'Davi — O Legado',
    description:
      'O instrumento do salmista de Israel: a parte da sua história que atravessou os séculos.',
    biblicalReference: '2 Samuel 23:1',
    asset: '/assets/items/harp.png',
  },
] as const;

export const EQUIPMENT: readonly EquipmentDefinition[] = [
  {
    id: 'helmet-of-salvation',
    slot: 'head',
    slotName: 'Cabeça',
    name: 'Capacete da Salvação',
    description: 'Protege o pensamento de quem já sabe a quem pertence.',
    biblicalReference: 'Efésios 6:17',
    asset: '/assets/items/helmet.png',
  },
  {
    id: 'breastplate-of-righteousness',
    slot: 'chest',
    slotName: 'Peitoral',
    name: 'Couraça da Justiça',
    description: 'Guarda o coração daquilo que ele mais tende a entregar.',
    biblicalReference: 'Efésios 6:14',
    asset: '/assets/items/breastplate.png',
  },
  {
    id: 'shield-of-faith',
    slot: 'hand',
    slotName: 'Mão',
    name: 'Escudo da Fé',
    description: 'Apaga os dardos inflamados que chegam antes da batalha.',
    biblicalReference: 'Efésios 6:16',
    asset: '/assets/items/shield.png',
  },
  {
    id: 'belt-of-truth',
    slot: 'waist',
    slotName: 'Cintura',
    name: 'Cinturão da Verdade',
    description: 'Sustenta tudo o mais no lugar quando o resto se move.',
    biblicalReference: 'Efésios 6:14',
    asset: '/assets/items/belt.png',
  },
  {
    id: 'shoes-of-readiness',
    slot: 'feet',
    slotName: 'Pés',
    name: 'Calçados da Preparação',
    description: 'Firmeza para avançar por terreno que ainda não foi pisado.',
    biblicalReference: 'Efésios 6:15',
    asset: '/assets/items/shoes.png',
  },
  {
    id: 'sword-of-the-spirit',
    slot: 'weapon',
    slotName: 'Arma',
    name: 'Espada do Espírito',
    description: 'A única peça ofensiva da armadura — e ela é a própria Palavra.',
    biblicalReference: 'Efésios 6:17',
    asset: '/assets/items/sword.png',
  },
] as const;

export const EQUIPMENT_SLOT_ORDER: readonly EquipmentSlot[] = [
  'head',
  'chest',
  'hand',
  'waist',
  'feet',
  'weapon',
] as const;

export function findCollectible(id: string): CollectibleDefinition | undefined {
  return COLLECTIBLES.find((item) => item.id === id);
}

export function findEquipment(id: string): EquipmentDefinition | undefined {
  return EQUIPMENT.find((item) => item.id === id);
}
