import { UIPanel } from './UIPanel.js';
import { questManager } from '../managers/QuestManager.js';
import { gameState } from '../managers/GameStateManager.js';

export class QuestPanel extends UIPanel {
  constructor() {
    super('quests', 'Quests');
    this.container.style.width = '250px';
    this.container.style.top = '320px';
    this.container.style.right = '20px';
    this.container.style.left = 'auto';
    this.render();

    gameState.on('quests', () => this.render());
  }

  private render() {
    const content = this.getContentDiv();
    const quests = questManager.getAllQuests();
    let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
    for (const quest of quests) {
      const statusColor = quest.state === 'completed' ? '#4a9' : quest.state === 'in_progress' ? '#cc4' : '#888';
      const statusText = quest.state === 'completed' ? 'Completed' : quest.state === 'in_progress' ? 'In Progress' : 'Not Started';
      const prereqText = quest.prerequisites.length > 0
        ? `Requires: ${quest.prerequisites.join(', ')}`
        : 'No prerequisites';
      const rewardParts: string[] = [];
      if (quest.rewards.xp) {
        rewardParts.push(
          ...Object.entries(quest.rewards.xp).map(([skill, amount]) => `${amount} ${skill} XP`)
        );
      }
      if (quest.rewards.items) {
        rewardParts.push(
          ...quest.rewards.items.map((item) => `${item.quantity}x ${item.name}`)
        );
      }
      if (quest.rewards.gold) {
        rewardParts.push(`${quest.rewards.gold} gold`);
      }
      const rewardText = rewardParts.length > 0 ? rewardParts.join(', ') : 'No listed rewards';
      html += `<div style="
        padding:8px;
        background:rgba(50,50,60,0.6);
        border:1px solid #4a4a5a;
        border-radius:3px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-weight:bold;color:#fff;">${quest.name}</span>
          <span style="font-size:10px;color:${statusColor};">${statusText}</span>
        </div>
        <div style="font-size:10px;color:#aaa;margin-bottom:4px;">${quest.description}</div>
        <div style="font-size:10px;color:#8b9;margin-bottom:4px;">${prereqText}</div>
        <div style="font-size:10px;color:#d8b86a;margin-bottom:4px;">Rewards: ${rewardText}</div>
        ${quest.state === 'in_progress' ? `<div style="font-size:10px;color:#ccc;">
          ${quest.objectives.map((obj) => `- ${obj.target}: ${obj.current}/${obj.amount}`).join('<br>')}
        </div>` : ''}
      </div>`;
    }
    html += '</div>';
    content.innerHTML = html;
  }
}
