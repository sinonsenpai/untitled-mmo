import { inventoryManager } from './InventoryManager.js';
import { gameState } from './GameStateManager.js';
import { getItem, type Item } from '@rpg/shared';
import type { ShopItem } from '@rpg/shared';

interface ShopData {
  shopName: string;
  items: ShopItem[];
}

export class ShopManager {
  private currentShopId: string | null = null;
  private shops: Map<string, ShopData> = new Map();

  registerShop(shopId: string, shopName: string, items: ShopItem[]): void {
    this.shops.set(shopId, { shopName, items });
  }

  openShop(shopId: string): void {
    this.currentShopId = shopId;
  }

  closeShop(): void {
    this.currentShopId = null;
  }

  getCurrentShop(): { shopName: string; items: ShopItem[] } | null {
    if (!this.currentShopId) return null;
    const shop = this.shops.get(this.currentShopId);
    if (!shop) return null;
    return { shopName: shop.shopName, items: shop.items };
  }

  buyItem(itemId: string, quantity: number = 1): boolean {
    if (!this.currentShopId) return false;
    const shop = this.shops.get(this.currentShopId);
    if (!shop) return false;

    const shopItem = shop.items.find((si) => si.itemId === itemId);
    if (!shopItem) return false;
    if (shopItem.stock !== -1 && shopItem.stock < quantity) return false;

    const totalCost = shopItem.buyPrice * quantity;
    const player = gameState.getState().player;
    if (player.gold < totalCost) return false;

    const template = getItem(itemId);
    if (!template) return false;

    const newItem = { ...template, quantity };
    const newInventory = addItemToInventoryHelper(player.inventory, newItem);

    if (newInventory === player.inventory && quantity > 0) {
      const existing = player.inventory.find((i) => i.id === itemId && i.quantity + quantity <= i.maxStack);
      if (!existing && player.inventory.length >= 28) return false;
    }

    player.inventory = newInventory;
    player.gold -= totalCost;

    if (shopItem.stock !== -1) {
      shopItem.stock -= quantity;
    }

    gameState['emit']('inventory', player.inventory);
    gameState['emit']('gold', player.gold);
    gameState['emit']('shop', shop.items);
    gameState.addChatMessage('System', `Bought ${quantity}x ${template.name} for ${totalCost} coins.`);
    return true;
  }

  sellItem(itemId: string, quantity: number = 1): boolean {
    if (!this.currentShopId) return false;
    const shop = this.shops.get(this.currentShopId);
    if (!shop) return false;

    const player = gameState.getState().player;
    const invItem = player.inventory.find((i) => i.id === itemId);
    if (!invItem || invItem.quantity < quantity) return false;

    const shopItem = shop.items.find((si) => si.itemId === itemId);
    if (!shopItem) return false;

    const totalValue = shopItem.sellPrice * quantity;

    player.inventory = removeItemFromInventoryHelper(player.inventory, itemId, quantity);
    player.gold += totalValue;

    if (shopItem.stock !== -1) {
      shopItem.stock += quantity;
    }

    gameState['emit']('inventory', player.inventory);
    gameState['emit']('gold', player.gold);
    gameState['emit']('shop', shop.items);
    gameState.addChatMessage('System', `Sold ${quantity}x ${invItem.name} for ${totalValue} coins.`);
    return true;
  }

  getPlayerGold(): number {
    return gameState.getState().player.gold;
  }
}

function addItemToInventoryHelper(inventory: Item[], item: Item): Item[] {
  const existing = inventory.find((i) => i.id === item.id && i.quantity < i.maxStack);
  if (existing && item.quantity + existing.quantity <= existing.maxStack) {
    existing.quantity += item.quantity;
    return [...inventory];
  }
  if (inventory.length >= 28) return inventory;
  return [...inventory, { ...item }];
}

function removeItemFromInventoryHelper(inventory: Item[], itemId: string, amount: number): Item[] {
  const idx = inventory.findIndex((i) => i.id === itemId);
  if (idx === -1) return inventory;
  const copy = [...inventory];
  if (copy[idx].quantity <= amount) {
    copy.splice(idx, 1);
  } else {
    copy[idx] = { ...copy[idx], quantity: copy[idx].quantity - amount };
  }
  return copy;
}

export const shopManager = new ShopManager();
