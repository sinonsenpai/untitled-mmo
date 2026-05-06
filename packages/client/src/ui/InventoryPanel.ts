import { UIPanel } from './UIPanel.js';
import { inventoryManager } from '../managers/InventoryManager.js';
import { gameState } from '../managers/GameStateManager.js';

export class InventoryPanel extends UIPanel {
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
    let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">';
    for (let i = 0; i < 28; i++) {
      const item = inventory[i];
      html += `<div style="
        width:40px;height:40px;
        background:rgba(50,50,60,0.8);
        border:1px solid #4a4a5a;
        border-radius:3px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:10px;
        color:#ccc;
        cursor:pointer;
        position:relative;
      " title="${item ? item.name : ''}">
        ${item ? `<span style="position:absolute;bottom:2px;right:4px;color:#ffcc00;font-size:9px;">${item.quantity > 1 ? item.quantity : ''}</span>` : ''}
        ${item ? item.name.substring(0, 2).toUpperCase() : ''}
      </div>`;
    }
    html += '</div>';
    content.innerHTML = html;
  }
}
