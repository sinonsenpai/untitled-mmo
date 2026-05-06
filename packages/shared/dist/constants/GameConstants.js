export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 20;
export const SKILL_NAMES = [
    'hp',
    'attack',
    'strength',
    'defence',
    'woodcutting',
    'mining',
    'smithing',
];
export function xpForLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.floor(total / 4);
}
export function levelForXp(xp) {
    let level = 1;
    while (level < 99 && xpForLevel(level + 1) <= xp) {
        level++;
    }
    return level;
}
