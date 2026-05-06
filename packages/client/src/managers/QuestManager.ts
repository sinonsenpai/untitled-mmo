import { createQuest, startQuest, updateObjective, type Quest, type QuestObjective } from '@rpg/shared';
import { gameState } from './GameStateManager.js';

export class QuestManager {
  private quests: Map<string, Quest> = new Map();

  constructor() {
    // Add starter quests
    const tutorial = createQuest('tutorial', 'Getting Started', 'Learn the basics of the game.', [
      { type: 'talk', target: 'guide', amount: 1, current: 0 },
      { type: 'skill', target: 'woodcutting', amount: 1, current: 0 },
    ]);
    this.quests.set(tutorial.id, tutorial);
  }

  getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  startQuest(id: string) {
    const quest = this.quests.get(id);
    if (!quest) return;
    this.quests.set(id, startQuest(quest));
    gameState['emit']('quests', this.getAllQuests());
  }

  updateObjective(questId: string, target: string, amount: number = 1) {
    const quest = this.quests.get(questId);
    if (!quest) return;
    const updated = updateObjective(quest, target, amount);
    this.quests.set(questId, updated);
    if (updated.state === 'completed') {
      gameState.addChatMessage('Quest', `Quest completed: ${updated.name}!`);
    }
    gameState['emit']('quests', this.getAllQuests());
  }

  addQuest(quest: Quest) {
    this.quests.set(quest.id, quest);
    gameState['emit']('quests', this.getAllQuests());
  }
}

export const questManager = new QuestManager();
