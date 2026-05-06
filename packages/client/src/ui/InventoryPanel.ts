import { UIPanel } from './UIPanel.js';
import { inventoryManager } from '../managers/InventoryManager.js';
import { firemakingManager } from '../managers/FiremakingManager.js';
import { gameState } from '../managers/GameStateManager.js';
import type { Item } from '@rpg/shared';

export class InventoryPanel extends UIPanel {
  private selectedIndex: number = -1;

  constructor() {
    super('inventory', 'Inventory');
    this.container.style.width = '200px';
    this.container.style.top = '100px';
    this.container.style.left = '20px';
    this.render();

    gameState.on('inventory', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    const inventory = inventoryManager.getInventory();
    const selectedItem = this.selectedIndex >= 0 ? inventory[this.selectedIndex] || null : null;

    let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">';
    for (let i = 0; i < 28; i++) {
      const item = inventory[i];
      const isSelected = this.selectedIndex === i;
      html += `<div data-slot="${i}" style="
        width:40px;height:40px;
        background:rgba(50,50,60,0.8);
        border:${isSelected ? '2px solid #ffcc00' : '1px solid #4a4a5a'};
        border-radius:3px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:10px;
        color:${item ? '#ccc' : '#555'};
        cursor:pointer;
        position:relative;
      " title="${item ? item.name : ''}">
        ${item ? `<span style="position:absolute;bottom:2px;right:4px;color:#ffcc00;font-size:9px;">${item.quantity > 1 ? item.quantity : ''}</span>` : ''}
        ${item ? item.name.substring(0, 2).toUpperCase() : ''}
      </div>`;
    }
    html += '</div>';

    if (selectedItem) {
      html += `<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;font-size:11px;color:#888;">`;
      html += `<span>${selectedItem.name}${selectedItem.quantity > 1 ? ` x${selectedItem.quantity}` : ''}</span>`;

      if (selectedItem.slot) {
        html += `<button data-action="equip" data-id="${selectedItem.id}" style="
          padding:3px 8px;
          background:#3a3a4a;
          border:1px solid #5a5a6a;
          border-radius:3px;
          color:#ccc;
          cursor:pointer;
          font-size:11px;
        ">Equip</button>`;
      }

      if (selectedItem.id === 'logs') {
        html += `<button data-action="light" data-id="${selectedItem.id}" style="
          padding:3px 8px;
          background:#d97706;
          border:1px solid #fbbf24;
          border-radius:3px;
          color:#fff;
          cursor:pointer;
          font-size:11px;
        ">Light</button>`;
      }

      html += '</div>';
    }

    content.innerHTML = html;

    content.querySelectorAll('[data-slot]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt((el as HTMLElement).dataset.slot!, 10);
        this.selectedIndex = this.selectedIndex === idx ? -1 : idx;
        this.render();
      });
    });

    content.querySelectorAll('[data-action="equip"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (el as HTMLElement).dataset.id!;
        inventoryManager.equip(itemId);
        this.selectedIndex = -1;
        this.render();
      });
    });

    content.querySelectorAll('[data-action="light"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const player = gameState.getState().player;
        const tileX = Math.round(player.position.x);
        const tileY = Math.round(player.position.y);
        firemakingManager.lightLog(tileX, tileY);
        this.selectedIndex = -1;
        this.render();
      });
    });
  }
}
