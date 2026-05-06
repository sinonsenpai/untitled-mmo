import { UIPanel } from './UIPanel.js';
import { bankManager } from '../managers/BankManager.js';
import { inventoryManager } from '../managers/InventoryManager.js';
import { gameState } from '../managers/GameStateManager.js';
import type { Item } from '@rpg/shared';

export class BankPanel extends UIPanel {
  private searchFilter: string = '';

  constructor() {
    super('bank', 'Bank of Gielinor');
    this.container.style.width = '460px';
    this.container.style.height = '480px';
    this.container.style.top = '80px';
    this.container.style.left = '300px';

    this.render();

    gameState.on('bank', () => this.render());
    gameState.on('inventory', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    content.style.padding = '8px';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.height = '100%';
    content.style.minHeight = '0';

    const bank = bankManager.getBankItems();
    const inv = inventoryManager.getInventory();
    const filtered = this.searchFilter
      ? bank.filter((i) => i.name.toLowerCase().includes(this.searchFilter.toLowerCase()))
      : bank;
    const usedSlots = bankManager.getBankUsedSlots();
    const freeSlots = bankManager.getBankFreeSlots();

    let html = '';

    html += `<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-shrink:0;">
      <span style="font-size:11px;color:#888;">Bank of Gielinor</span>
      <span style="font-size:11px;color:#ffcc00;">${usedSlots}/${usedSlots + freeSlots} slots</span>
      <button data-action="depositAll" style="margin-left:auto;padding:4px 8px;background:#3a3a4a;border:1px solid #5a5a6a;border-radius:3px;color:#fff;cursor:pointer;font-size:11px;">Deposit All</button>
    </div>`;

    html += `<div style="margin-bottom:8px;flex-shrink:0;">
      <input data-action="search" placeholder="Search bank..." value="${this.searchFilter}" style="
        width:100%;box-sizing:border-box;
        background:rgba(0,0,0,0.4);
        border:1px solid #4a4a5a;
        border-radius:3px;
        padding:4px 8px;
        color:#fff;
        font-size:12px;
        outline:none;
      ">
    </div>`;

    html += '<div style="flex:1;overflow-y:auto;min-height:0;margin-bottom:8px;">';
    html += '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:3px;">';

    const displayedSlots = filtered.slice(0, 400);
    for (let i = 0; i < 400 && i < displayedSlots.length + (400 - usedSlots > 0 ? 400 : 0); i++) {
      const item = i < displayedSlots.length ? displayedSlots[i] : null;
      html += this.makeBankSlot(item, i);
    }

    html += '</div></div>';

    html += '<div style="border-top:1px solid #4a4a5a;padding-top:8px;flex-shrink:0;">';
    html += '<div style="font-size:11px;color:#888;margin-bottom:4px;">Inventory</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">';
    for (let i = 0; i < 28; i++) {
      const item = inv[i] || null;
      html += this.makeInvSlot(item, i);
    }
    html += '</div></div>';

    content.innerHTML = html;

    content.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = (el as HTMLElement).dataset.action;
        if (action === 'depositAll') {
          bankManager.depositAll();
        }
      });
    });

    content.querySelectorAll('[data-action="search"]').forEach((el) => {
      el.addEventListener('input', (e) => {
        this.searchFilter = (el as HTMLInputElement).value;
        this.render();
      });
    });

    content.querySelectorAll('[data-deposit]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (el as HTMLElement).dataset.deposit!;
        bankManager.deposit(itemId, 1);
      });
    });

    content.querySelectorAll('[data-withdraw]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (el as HTMLElement).dataset.withdraw!;
        bankManager.withdraw(itemId, 1);
      });
    });
  }

  private makeBankSlot(item: Item | null, _index: number): string {
    if (!item) {
      return `<div style="
        width:46px;height:46px;
        background:rgba(30,30,40,0.6);
        border:1px solid #3a3a4a;
        border-radius:3px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:9px;
        color:#555;
      "></div>`;
    }

    return `<div data-withdraw="${item.id}" style="
      width:46px;height:46px;
      background:rgba(50,50,60,0.8);
      border:1px solid #4a4a5a;
      border-radius:3px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:9px;
      color:#ccc;
      cursor:pointer;
      position:relative;
    " title="${item.name}">
      ${item.name.substring(0, 2).toUpperCase()}
      <span style="position:absolute;bottom:2px;right:4px;color:#ffcc00;font-size:8px;">${item.quantity > 1 ? item.quantity : ''}</span>
    </div>`;
  }

  private makeInvSlot(item: Item | null, _index: number): string {
    if (!item) {
      return `<div style="
        width:46px;height:46px;
        background:rgba(30,30,40,0.6);
        border:1px solid #3a3a4a;
        border-radius:3px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:9px;
        color:#555;
      "></div>`;
    }

    return `<div data-deposit="${item.id}" style="
      width:46px;height:46px;
      background:rgba(50,50,60,0.8);
      border:1px solid #4a4a5a;
      border-radius:3px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:9px;
      color:#ccc;
      cursor:pointer;
      position:relative;
    " title="${item.name}">
      ${item.name.substring(0, 2).toUpperCase()}
      <span style="position:absolute;bottom:2px;right:4px;color:#ffcc00;font-size:8px;">${item.quantity > 1 ? item.quantity : ''}</span>
    </div>`;
  }
}
