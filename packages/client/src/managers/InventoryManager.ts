import {
  addItemToInventory,
  removeItemFromInventory,
  equipItem,
  unequipItem,
  getItem,
  type Item,
  type EquipSlot,
} from '@rpg/shared';
import { gameState } from './GameStateManager.js';

export class InventoryManager {
  addItem(itemId: string, quantity: number = 1) {
    const template = getItem(itemId);
    if (!template) return;
    const item = { ...template, quantity };
    const player = gameState.getState().player;
    player.inventory = addItemToInventory(player.inventory, item);
    gameState['emit']('inventory', player.inventory);
  }

  removeItem(itemId: string, quantity: number = 1) {
    const player = gameState.getState().player;
    player.inventory = removeItemFromInventory(player.inventory, itemId, quantity);
    gameState['emit']('inventory', player.inventory);
  }

  equip(itemId: string) {
    const player = gameState.getState().player;
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || !item.slot) return;

    // Unequip current item in that slot if any
    const current = player.equipment[item.slot];
    if (current) {
      player.inventory = addItemToInventory(player.inventory, current);
    }

    player.equipment = equipItem(player.equipment, item);
    player.inventory = removeItemFromInventory(player.inventory, itemId, 1);
    gameState['emit']('equipment', player.equipment);
    gameState['emit']('inventory', player.inventory);
  }

  unequip(slot: EquipSlot) {
    const player = gameState.getState().player;
    const item = player.equipment[slot];
    if (!item) return;

    player.inventory = addItemToInventory(player.inventory, item);
    player.equipment = unequipItem(player.equipment, slot);
    gameState['emit']('equipment', player.equipment);
    gameState['emit']('inventory', player.inventory);
  }

  getInventory(): Item[] {
    return gameState.getState().player.inventory;
  }

  getEquipment(): Partial<Record<EquipSlot, Item>> {
    return gameState.getState().player.equipment;
  }
}

export const inventoryManager = new InventoryManager();
