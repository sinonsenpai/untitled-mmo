import type { Item, EquipSlot } from '../types/index.js';

export const ITEM_DATABASE: Record<string, Item> = {
  // Materials
  'logs': { id: 'logs', name: 'Logs', quantity: 1, maxStack: 999 },
  'oak_logs': { id: 'oak_logs', name: 'Oak logs', quantity: 1, maxStack: 999 },
  'copper_ore': { id: 'copper_ore', name: 'Copper ore', quantity: 1, maxStack: 999 },
  'tin_ore': { id: 'tin_ore', name: 'Tin ore', quantity: 1, maxStack: 999 },
  'bronze_bar': { id: 'bronze_bar', name: 'Bronze bar', quantity: 1, maxStack: 999 },
  'feather': { id: 'feather', name: 'Feather', quantity: 1, maxStack: 999 },
  'bowstring': { id: 'bowstring', name: 'Bowstring', quantity: 1, maxStack: 999 },
  'arrow_shaft': { id: 'arrow_shaft', name: 'Arrow shaft', quantity: 1, maxStack: 999 },
  'bronze_arrowhead': { id: 'bronze_arrowhead', name: 'Bronze arrowheads', quantity: 1, maxStack: 999 },

  // Smithing products (Bronze tier)
  'bronze_dagger': { id: 'bronze_dagger', name: 'Bronze dagger', quantity: 1, maxStack: 1, slot: 'weapon', stats: { attackBonus: 4, strengthBonus: 3 } },
  'bronze_sword': { id: 'bronze_sword', name: 'Bronze sword', quantity: 1, maxStack: 1, slot: 'weapon', stats: { attackBonus: 6, strengthBonus: 5 } },
  'bronze_axe': { id: 'bronze_axe', name: 'Bronze axe', quantity: 1, maxStack: 1, slot: 'weapon', stats: { attackBonus: 3, strengthBonus: 3 } },
  'bronze_pickaxe': { id: 'bronze_pickaxe', name: 'Bronze pickaxe', quantity: 1, maxStack: 1, slot: 'weapon', stats: { attackBonus: 3, strengthBonus: 3 } },
  'bronze_helm': { id: 'bronze_helm', name: 'Bronze full helm', quantity: 1, maxStack: 1, slot: 'head', stats: { defenceBonus: 3 } },
  'bronze_body': { id: 'bronze_body', name: 'Bronze platebody', quantity: 1, maxStack: 1, slot: 'body', stats: { defenceBonus: 8 } },
  'bronze_legs': { id: 'bronze_legs', name: 'Bronze platelegs', quantity: 1, maxStack: 1, slot: 'legs', stats: { defenceBonus: 5 } },

  // Fletching products
  'shortbow': { id: 'shortbow', name: 'Shortbow', quantity: 1, maxStack: 1, slot: 'weapon', stats: { rangedBonus: 8 } },
  'bronze_arrow': { id: 'bronze_arrow', name: 'Bronze arrow', quantity: 1, maxStack: 999, slot: 'ammo', stats: { rangedBonus: 7 } },

  // Other
  'wooden_shield': { id: 'wooden_shield', name: 'Wooden shield', quantity: 1, maxStack: 1, slot: 'shield', stats: { defenceBonus: 2 } },
  'shrimp': { id: 'shrimp', name: 'Raw shrimp', quantity: 1, maxStack: 999 },
  'coins': { id: 'coins', name: 'Coins', quantity: 1, maxStack: 999999 },
  'bread': { id: 'bread', name: 'Bread', quantity: 1, maxStack: 999 },
};

export function getItem(id: string): Item | undefined {
  const template = ITEM_DATABASE[id];
  if (!template) return undefined;
  return { ...template };
}
