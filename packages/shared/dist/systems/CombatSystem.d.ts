import type { CombatStats, DropTable, Drop, Item } from '../types/index.js';
export declare function calculateMaxHit(strengthLevel: number, strengthBonus: number): number;
export declare function calculateAccuracyRoll(attackLevel: number, attackBonus: number): number;
export declare function calculateDefenceRoll(defenceLevel: number, defenceBonus: number): number;
export declare function rollHit(accuracyRoll: number, defenceRoll: number): boolean;
export declare function rollDamage(maxHit: number): number;
export declare function rollDrop(dropTable: DropTable): Drop[];
export declare function getCombatLevel(stats: CombatStats): number;
export declare function getEquipmentBonus(equipment: Partial<Record<string, Item>>, style: string): number;
