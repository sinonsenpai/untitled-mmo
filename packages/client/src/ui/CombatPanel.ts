import { UIPanel } from './UIPanel.js';
import { combatManager } from '../managers/CombatManager.js';
import { gameState } from '../managers/GameStateManager.js';
import type { AttackStyle } from '@rpg/shared';

export class CombatPanel extends UIPanel {
  constructor() {
    super('combat', 'Combat');
    this.container.style.width = '180px';
    this.container.style.top = '100px';
    this.container.style.left = '240px';
    this.render();

    gameState.on('attackStyle', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    const style = combatManager.getAttackStyle();
    const player = gameState.getState().player;
    const eqStats = this.getEquipmentStats();
    const attackLevel = player.skills.attack?.level ?? 1;
    const strengthLevel = player.skills.strength?.level ?? 1;
    const defenceLevel = player.skills.defence?.level ?? 1;

    let html = '<div style="font-size:12px;">';
    html += `<div style="font-weight:bold;margin-bottom:6px;color:#ffcc00;">Attack Style</div>`;

    html += this.makeStyleButton('Accurate', 'accurate', style, `+3 Attack`);
    html += this.makeStyleButton('Aggressive', 'aggressive', style, `+3 Strength`);
    html += this.makeStyleButton('Defensive', 'defensive', style, `+3 Defence`);

    html += `<div style="margin-top:12px;font-size:11px;color:#ccc;">`;
    html += `<div>Attack: <span style="color:#4a9;">${attackLevel}</span></div>`;
    html += `<div>Strength: <span style="color:#4a9;">${strengthLevel}</span></div>`;
    html += `<div>Defence: <span style="color:#4a9;">${defenceLevel}</span></div>`;
    html += `<div style="margin-top:6px;color:#888;">Bonuses:</div>`;
    html += `<div>Atk: +${eqStats.attack} | Str: +${eqStats.strength} | Def: +${eqStats.defence}</div>`;
    html += '</div>';

    html += '</div>';
    content.innerHTML = html;

    content.querySelectorAll('[data-style]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = (el as HTMLElement).dataset.style as AttackStyle;
        combatManager.setAttackStyle(s);
      });
    });
  }

  private makeStyleButton(label: string, style: AttackStyle, current: AttackStyle, bonus: string): string {
    const active = current === style;
    return `<button data-style="${style}" style="
      display:block;
      width:100%;
      padding:6px;
      margin-bottom:4px;
      background:${active ? '#4a9' : '#3a3a4a'};
      border:1px solid #5a5a6a;
      border-radius:3px;
      color:#fff;
      cursor:pointer;
      font-size:11px;
      text-align:left;
    ">
      <span style="font-weight:bold;">${label}</span>
      <span style="float:right;color:#888;font-size:10px;">${bonus}</span>
    </button>`;
  }

  private getEquipmentStats(): { attack: number; strength: number; defence: number } {
    let attack = 0;
    let strength = 0;
    let defence = 0;
    const equipment = gameState.getState().player.equipment;
    for (const item of Object.values(equipment)) {
      if (!item?.stats) continue;
      attack += item.stats.attackBonus ?? 0;
      strength += item.stats.strengthBonus ?? 0;
      defence += item.stats.defenceBonus ?? 0;
    }
    return { attack, strength, defence };
  }
}
