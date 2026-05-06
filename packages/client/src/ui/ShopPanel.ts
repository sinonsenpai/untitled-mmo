import { UIPanel } from './UIPanel.js';
import { shopManager } from '../managers/ShopManager.js';
import { inventoryManager } from '../managers/InventoryManager.js';
import { gameState } from '../managers/GameStateManager.js';
import { getItem } from '@rpg/shared';
import type { ShopItem, Item } from '@rpg/shared';

export class ShopPanel extends UIPanel {
  constructor() {
    super('shop', 'Shop');
    this.container.style.width = '480px';
    this.container.style.height = '440px';
    this.container.style.top = '80px';
    this.container.style.left = '300px';

    this.render();

    gameState.on('shop', () => this.render());
    gameState.on('inventory', () => this.render());
    gameState.on('gold', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    const shop = shopManager.getCurrentShop();
    const inv = inventoryManager.getInventory();
    const gold = shopManager.getPlayerGold();

    if (!shop) {
      content.innerHTML = '<div style="color:#888;font-size:12px;text-align:center;padding-top:40px;">No shop open.</div>';
      return;
    }

    let html = '';

    html += `<div style="margin-bottom:8px;">
      <span style="font-weight:bold;">${shop.shopName}</span>
      <span style="float:right;color:#ffcc00;">${gold.toLocaleString()} coins</span>
    </div>`;

    html += '<div style="display:flex;gap:8px;height:340px;">';

    // Left: Shop stock
    html += '<div style="flex:1;display:flex;flex-direction:column;">';
    html += '<div style="font-size:11px;color:#888;margin-bottom:4px;">Shop Stock</div>';
    html += '<div style="flex:1;overflow-y:auto;border:1px solid #4a4a5a;border-radius:3px;padding:4px;">';
    for (const shopItem of shop.items) {
      html += this.makeShopStockRow(shopItem, inv, gold);
    }
    html += '</div></div>';

    // Right: Player inventory (sellable)
    html += '<div style="flex:1;display:flex;flex-direction:column;">';
    html += '<div style="font-size:11px;color:#888;margin-bottom:4px;">Your Inventory (click to sell)</div>';
    html += '<div style="flex:1;overflow-y:auto;border:1px solid #4a4a5a;border-radius:3px;padding:4px;">';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;">';
    for (const invItem of inv) {
      const shopItem = shop.items.find((si) => si.itemId === invItem.id);
      if (shopItem) {
        html += this.makeSellSlot(invItem, shopItem);
      }
    }
    html += '</div></div></div>';

    html += '</div>';
    content.innerHTML = html;

    content.querySelectorAll('[data-buy]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (el as HTMLElement).dataset.buy!;
        shopManager.buyItem(itemId, 1);
      });
    });

    content.querySelectorAll('[data-sell]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (el as HTMLElement).dataset.sell!;
        shopManager.sellItem(itemId, 1);
      });
    });
  }

  private makeShopStockRow(shopItem: ShopItem, inv: Item[], gold: number): string {
    const template = getItem(shopItem.itemId);
    if (!template) return '';
    const canBuy = gold >= shopItem.buyPrice && (shopItem.stock === -1 || shopItem.stock > 0);
    const stockText = shopItem.stock === -1 ? '∞' : String(shopItem.stock);

    return `<div data-buy="${shopItem.itemId}" style="
      display:flex;
      align-items:center;
      gap:6px;
      padding:4px 6px;
      margin-bottom:2px;
      background:${canBuy ? 'rgba(74,170,153,0.1)' : 'rgba(204,85,85,0.1)'};
      border:1px solid #4a4a5a;
      border-radius:3px;
      cursor:${canBuy ? 'pointer' : 'default'};
      font-size:11px;
    ">
      <span style="width:24px;height:24px;background:rgba(50,50,60,0.8);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;">${template.name.substring(0, 2).toUpperCase()}</span>
      <span style="flex:1;color:${canBuy ? '#ccc' : '#c55'};">${template.name}</span>
      <span style="color:#ffcc00;font-size:10px;">${shopItem.buyPrice} gp</span>
      <span style="color:#888;font-size:9px;">x${stockText}</span>
    </div>`;
  }

  private makeSellSlot(invItem: Item, shopItem: ShopItem): string {
    return `<div data-sell="${invItem.id}" style="
      width:60px;height:60px;
      background:rgba(50,50,60,0.8);
      border:1px solid #4a4a5a;
      border-radius:3px;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      position:relative;
    " title="${invItem.name}">
      <span style="font-size:9px;color:#ccc;">${invItem.name.substring(0, 2).toUpperCase()}</span>
      <span style="font-size:8px;color:#ffcc00;">${shopItem.sellPrice} gp</span>
      <span style="position:absolute;bottom:2px;right:4px;color:#ffcc00;font-size:8px;">${invItem.quantity > 1 ? invItem.quantity : ''}</span>
    </div>`;
  }
}
