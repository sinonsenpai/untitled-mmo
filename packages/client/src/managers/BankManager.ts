import {
  addItemToInventory,
  removeItemFromInventory,
  getItem,
  type Item,
} from '@rpg/shared';
import { gameState } from './GameStateManager.js';

const BANK_CAPACITY = 400;

export class BankManager {
  deposit(itemId: string, quantity: number): boolean {
    const player = gameState.getState().player;
    const invItem = player.inventory.find((i) => i.id === itemId);
    if (!invItem || invItem.quantity < quantity) return false;

    const template = getItem(itemId);
    if (!template) return false;

    const bankItem = player.bank.find((i) => i.id === itemId);
    if (!bankItem && player.bank.length >= BANK_CAPACITY) return false;

    player.inventory = removeItemFromInventory(player.inventory, itemId, quantity);

    if (bankItem) {
      bankItem.quantity += quantity;
    } else {
      player.bank.push({ ...template, quantity });
    }

    gameState['emit']('inventory', player.inventory);
    gameState['emit']('bank', player.bank);
    return true;
  }

  withdraw(itemId: string, quantity: number): boolean {
    const player = gameState.getState().player;
    const bankItem = player.bank.find((i) => i.id === itemId);
    if (!bankItem || bankItem.quantity < quantity) return false;

    const template = getItem(itemId);
    if (!template) return false;

    const withdrawItem = { ...template, quantity };
    const newInventory = addItemToInventory(player.inventory, withdrawItem);

    if (newInventory === player.inventory && quantity > 0) {
      const existingInv = player.inventory.find((i) => i.id === itemId && i.quantity + quantity <= i.maxStack);
      if (!existingInv && player.inventory.length >= 28) return false;
    }

    player.inventory = newInventory;

    if (bankItem.quantity <= quantity) {
      player.bank = player.bank.filter((i) => i.id !== itemId);
    } else {
      bankItem.quantity -= quantity;
    }

    gameState['emit']('inventory', player.inventory);
    gameState['emit']('bank', player.bank);
    return true;
  }

  depositAll(): void {
    const player = gameState.getState().player;
    const invCopy = [...player.inventory];
    let changed = false;

    for (const invItem of invCopy) {
      const bankItem = player.bank.find((i) => i.id === invItem.id);
      if (!bankItem && player.bank.length >= BANK_CAPACITY) continue;

      player.inventory = removeItemFromInventory(player.inventory, invItem.id, invItem.quantity);

      if (bankItem) {
        bankItem.quantity += invItem.quantity;
      } else {
        player.bank.push({ ...invItem });
      }
      changed = true;
    }

    if (changed) {
      gameState['emit']('inventory', player.inventory);
      gameState['emit']('bank', player.bank);
    }
  }

  getBankItems(): Item[] {
    return gameState.getState().player.bank;
  }

  getBankUsedSlots(): number {
    return gameState.getState().player.bank.length;
  }

  getBankFreeSlots(): number {
    return BANK_CAPACITY - this.getBankUsedSlots();
  }
}

export const bankManager = new BankManager();
