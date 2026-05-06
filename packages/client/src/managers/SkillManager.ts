import { addXp, type Skill } from '@rpg/shared';
import { gameState } from './GameStateManager.js';

export class SkillManager {
  addXp(skillId: string, amount: number) {
    const player = gameState.getState().player;
    const skill = player.skills[skillId];
    if (!skill) return;

    const oldLevel = skill.level;
    player.skills[skillId] = addXp(skill, amount);
    const newLevel = player.skills[skillId].level;

    if (newLevel > oldLevel) {
      gameState.addChatMessage('System', `Congratulations! Your ${skill.name} level is now ${newLevel}.`);
    }

    gameState['emit']('skills', player.skills);
  }

  getSkill(skillId: string): Skill | undefined {
    return gameState.getState().player.skills[skillId];
  }

  getAllSkills(): Record<string, Skill> {
    return gameState.getState().player.skills;
  }
}

export const skillManager = new SkillManager();
