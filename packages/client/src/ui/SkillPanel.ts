import { UIPanel } from './UIPanel.js';
import { skillManager } from '../managers/SkillManager.js';
import { gameState } from '../managers/GameStateManager.js';
import { levelForXp, xpForLevel } from '@rpg/shared';

const SKILL_ORDER = ['attack', 'strength', 'defence', 'hp', 'woodcutting', 'mining', 'smithing', 'fletching'];

export class SkillPanel extends UIPanel {
  constructor() {
    super('skills', 'Skills');
    this.container.style.width = '220px';
    this.container.style.top = '320px';
    this.container.style.left = '20px';
    this.render();

    gameState.on('skills', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    const skills = skillManager.getAllSkills();
    let html = '<div style="display:flex;flex-direction:column;gap:3px;">';
    for (const id of SKILL_ORDER) {
      const skill = skills[id];
      if (!skill) continue;
      const nextXp = xpForLevel(Math.min(skill.level + 1, 99));
      const prevXp = xpForLevel(skill.level);
      const progress = skill.level >= 99 ? 100 : ((skill.xp - prevXp) / (nextXp - prevXp)) * 100;
      html += `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;">
        <span style="width:90px;font-size:11px;color:#ccc;">${skill.name}</span>
        <span style="width:24px;text-align:right;font-size:12px;font-weight:bold;color:#ffcc00;">${skill.level}</span>
        <div style="flex:1;height:8px;background:rgba(0,0,0,0.4);border-radius:4px;overflow:hidden;">
          <div style="width:${progress}%;height:100%;background:#4a9;transition:width 0.3s;"></div>
        </div>
      </div>`;
    }
    html += '</div>';
    content.innerHTML = html;
  }
}
