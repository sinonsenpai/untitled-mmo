import { UIPanel } from './UIPanel.js';
import { inventoryManager } from '../managers/InventoryManager.js';
import { gameState } from '../managers/GameStateManager.js';
import type { EquipSlot } from '@rpg/shared';

const SLOTS: { slot: EquipSlot; label: string }[] = [
  { slot: 'head', label: 'Head' },
  { slot: 'cape', label: 'Cape' },
  { slot: 'amulet', label: 'Amulet' },
  { slot: 'weapon', label: 'Weapon' },
  { slot: 'body', label: 'Body' },
  { slot: 'shield', label: 'Shield' },
  { slot: 'legs', label: 'Legs' },
  { slot: 'hands', label: 'Hands' },
  { slot: 'feet', label: 'Feet' },
  { slot: 'ring', label: 'Ring' },
  { slot: 'ammo', label: 'Ammo' },
];

export class EquipmentPanel extends UIPanel {
  constructor() {
    super('equipment', 'Equipment');
    this.container.style.width = '180px';
    this.container.style.top = '100px';
    this.container.style.right = '20px';
    this.container.style.left = 'auto';
    this.render();

    gameState.on('equipment', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    const equipment = inventoryManager.getEquipment();
    let html = '<div style="display:flex;flex-direction:column;gap:4px;">';
    for (const { slot, label } of SLOTS) {
      const item = equipment[slot];
      html += `<div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:4px 8px;
        background:rgba(50,50,60,0.6);
        border:1px solid #4a4a5a;
        border-radius:3px;
        font-size:11px;
      ">
        <span style="color:#888;">${label}</span>
        <span style="color:#fff;">${item ? item.name : '-'}</span>
      </div>`;
    }
    html += '</div>';
    content.innerHTML = html;
  }
}
