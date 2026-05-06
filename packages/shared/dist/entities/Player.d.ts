import type { PlayerData, Item, EquipSlot } from '../types/index.js';
export declare function createDefaultPlayer(name: string): PlayerData;
export declare function addItemToInventory(inventory: Item[], item: Item): Item[];
export declare function removeItemFromInventory(inventory: Item[], itemId: string, amount?: number): Item[];
export declare function equipItem(equipment: Partial<Record<EquipSlot, Item>>, item: Item): Partial<Record<EquipSlot, Item>>;
export declare function unequipItem(equipment: Partial<Record<EquipSlot, Item>>, slot: EquipSlot): Partial<Record<EquipSlot, Item>>;
