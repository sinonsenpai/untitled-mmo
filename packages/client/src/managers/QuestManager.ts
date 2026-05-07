import { createQuest, getItem, startQuest, updateObjective, type Item, type Quest } from '@rpg/shared';
import { gameState } from './GameStateManager.js';
import { inventoryManager } from './InventoryManager.js';
import { skillManager } from './SkillManager.js';

export class QuestManager {
  private quests: Map<string, Quest> = new Map();

  constructor() {
    this.registerDefaultQuests();
  }

  private registerDefaultQuests() {
    const makeRewardItem = (id: string, quantity: number): Item => {
      const item = getItem(id);
      if (!item) {
        return { id, name: id, quantity, maxStack: 999 };
      }
      return { ...item, quantity };
    };

    const tutorial = createQuest(
      'tutorial',
      'Getting Started',
      'Learn the basics of the game.',
      [
        { type: 'talk', target: 'guide', amount: 1, current: 0 },
        { type: 'skill', target: 'woodcutting', amount: 1, current: 0 },
      ]
    );

    const bronzeAge = createQuest(
      'bronze_age',
      'The Bronze Age',
      'Smelt bronze, forge a sword, and prove your smithing basics.',
      [
        { type: 'craft', target: 'bronze_bar', amount: 5, current: 0 },
        { type: 'craft', target: 'bronze_sword', amount: 1, current: 0 },
      ],
      {
        xp: { smithing: 500 },
        items: [makeRewardItem('bronze_body', 1)],
      },
      ['tutorial']
    );

    const fletchingQuest = createQuest(
      'fletching_we_will_go',
      'A Fletching We Will Go',
      'String together arrows and prepare a shortbow.',
      [
        { type: 'craft', target: 'bronze_arrow', amount: 50, current: 0 },
        { type: 'craft', target: 'shortbow', amount: 1, current: 0 },
      ],
      {
        xp: { fletching: 500 },
        items: [makeRewardItem('feather', 100)],
      },
      ['tutorial']
    );

    const pestControl = createQuest(
      'pest_control',
      'Pest Control',
      'Thin out the giant rat population around the dungeon entrance.',
      [{ type: 'kill', target: 'giant_rat', amount: 10, current: 0 }],
      {
        xp: {
          attack: 125,
          strength: 125,
          defence: 125,
          hp: 125,
        },
        gold: 100,
      },
      ['tutorial']
    );

    for (const quest of [tutorial, bronzeAge, fletchingQuest, pestControl]) {
      this.quests.set(quest.id, quest);
    }
  }

  private getCompletedQuestIds(): Set<string> {
    return new Set(
      Array.from(this.quests.values())
        .filter((quest) => quest.state === 'completed')
        .map((quest) => quest.id)
    );
  }

  private grantQuestRewards(quest: Quest) {
    const player = gameState.getState().player;

    if (quest.rewards.xp) {
      for (const [skillId, amount] of Object.entries(quest.rewards.xp)) {
        skillManager.addXp(skillId, amount);
      }
    }

    if (quest.rewards.gold) {
      player.gold += quest.rewards.gold;
      gameState.addChatMessage('System', `You receive ${quest.rewards.gold} gold.`);
    }

    if (quest.rewards.items) {
      for (const reward of quest.rewards.items) {
        const received = inventoryManager.addItem(reward.id, reward.quantity);
        if (!received) {
          gameState.addChatMessage(
            'System',
            `Your inventory is full, so you could not receive ${reward.quantity}x ${reward.id}.`
          );
        }
      }
    }

    if (quest.rewards.unlockAreas?.length) {
      gameState.addChatMessage(
        'System',
        `Unlocked areas: ${quest.rewards.unlockAreas.join(', ')}.`
      );
    }
  }

  private refreshAvailableQuests() {
    let startedAny = false;

    for (const quest of this.quests.values()) {
      if (quest.state !== 'not_started') continue;
      if (!this.canStartQuest(quest.id)) continue;

      this.quests.set(quest.id, startQuest(quest, this.getCompletedQuestIds()));
      gameState.addChatMessage('Quest', `New quest available: ${quest.name}.`);
      startedAny = true;
    }

    if (startedAny) {
      gameState['emit']('quests', this.getAllQuests());
    }
  }

  getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  canStartQuest(id: string): boolean {
    const quest = this.quests.get(id);
    if (!quest) return false;
    return quest.prerequisites.every((questId) => this.quests.get(questId)?.state === 'completed');
  }

  startQuest(id: string): boolean {
    const quest = this.quests.get(id);
    if (!quest) return false;
    if (quest.state !== 'not_started') return false;
    if (!this.canStartQuest(id)) {
      gameState.addChatMessage('Quest', `You do not meet the requirements for ${quest.name}.`);
      return false;
    }

    this.quests.set(id, startQuest(quest, this.getCompletedQuestIds()));
    gameState['emit']('quests', this.getAllQuests());
    return true;
  }

  updateObjective(questId: string, target: string, amount: number = 1) {
    const quest = this.quests.get(questId);
    if (!quest) return;

    const updated = updateObjective(quest, target, amount);
    this.quests.set(questId, updated);

    if (quest.state !== 'completed' && updated.state === 'completed') {
      this.grantQuestRewards(updated);
      gameState.addChatMessage('Quest', `Quest completed: ${updated.name}!`);
      this.refreshAvailableQuests();
    }

    gameState['emit']('quests', this.getAllQuests());
  }

  recordProgress(target: string, amount: number = 1) {
    let changed = false;

    for (const quest of this.quests.values()) {
      if (quest.state !== 'in_progress') continue;
      if (!quest.objectives.some((objective) => objective.target === target)) continue;

      const updated = updateObjective(quest, target, amount);
      this.quests.set(quest.id, updated);
      changed = true;

      if (updated.state === 'completed') {
        this.grantQuestRewards(updated);
        gameState.addChatMessage('Quest', `Quest completed: ${updated.name}!`);
        this.refreshAvailableQuests();
      }
    }

    if (changed) {
      gameState['emit']('quests', this.getAllQuests());
    }
  }

  addQuest(quest: Quest) {
    this.quests.set(quest.id, quest);
    gameState['emit']('quests', this.getAllQuests());
  }
}

export const questManager = new QuestManager();
