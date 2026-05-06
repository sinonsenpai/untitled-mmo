import type { Quest, QuestObjective } from '../types/index.js';
export declare function createQuest(id: string, name: string, description: string, objectives: QuestObjective[]): Quest;
export declare function startQuest(quest: Quest): Quest;
export declare function updateObjective(quest: Quest, target: string, amount?: number): Quest;
