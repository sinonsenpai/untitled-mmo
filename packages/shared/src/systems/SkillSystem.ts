import { levelForXp } from '../constants/GameConstants.js';
import type { Skill } from '../types/index.js';

export function addXp(skill: Skill, amount: number): Skill {
  const newXp = skill.xp + amount;
  const newLevel = levelForXp(newXp);
  return {
    ...skill,
    xp: newXp,
    level: Math.min(newLevel, skill.maxLevel),
  };
}
