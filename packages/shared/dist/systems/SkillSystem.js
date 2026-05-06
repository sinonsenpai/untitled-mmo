import { levelForXp } from '../constants/GameConstants.js';
export function addXp(skill, amount) {
    const newXp = skill.xp + amount;
    const newLevel = levelForXp(newXp);
    return {
        ...skill,
        xp: newXp,
        level: Math.min(newLevel, skill.maxLevel),
    };
}
