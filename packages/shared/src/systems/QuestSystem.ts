import type { Quest, QuestObjective, QuestRewards } from '../types/index.js';

export function createQuest(
  id: string,
  name: string,
  description: string,
  objectives: QuestObjective[],
  rewards: QuestRewards = {},
  prerequisites: string[] = []
): Quest {
  return {
    id,
    name,
    description,
    state: 'not_started',
    objectives: objectives.map((o) => ({ ...o, current: 0 })),
    rewards,
    prerequisites,
  };
}

export function canStartQuest(quest: Quest, completedQuestIds: Set<string> = new Set()): boolean {
  return quest.prerequisites.every((questId) => completedQuestIds.has(questId));
}

export function startQuest(quest: Quest, completedQuestIds: Set<string> = new Set()): Quest {
  if (quest.state !== 'not_started') return quest;
  if (!canStartQuest(quest, completedQuestIds)) return quest;
  return { ...quest, state: 'in_progress' };
}

export function updateObjective(
  quest: Quest,
  target: string,
  amount: number = 1
): Quest {
  if (quest.state !== 'in_progress') return quest;
  const objectives = quest.objectives.map((obj) => {
    if (obj.target === target) {
      return { ...obj, current: Math.min(obj.current + amount, obj.amount) };
    }
    return obj;
  });
  const allComplete = objectives.every((obj) => obj.current >= obj.amount);
  return {
    ...quest,
    objectives,
    state: allComplete ? 'completed' : 'in_progress',
  };
}
