import type { Item } from '../types/index.js';
export interface Recipe {
    id: string;
    name: string;
    skill: 'smithing' | 'fletching';
    levelRequired: number;
    ingredients: {
        itemId: string;
        quantity: number;
    }[];
    output: {
        itemId: string;
        quantity: number;
    };
    xp: number;
}
export declare const RECIPES: Recipe[];
export declare function getRecipeById(id: string): Recipe | undefined;
export declare function getRecipesForSkill(skill: 'smithing' | 'fletching'): Recipe[];
export declare function countItemInInventory(inventory: Item[], itemId: string): number;
export declare function hasIngredients(inventory: Item[], ingredients: {
    itemId: string;
    quantity: number;
}[]): boolean;
export declare function canCraft(recipe: Recipe, inventory: Item[], skills: Record<string, {
    level: number;
}>): boolean;
export declare function getMaxCraftableCount(recipe: Recipe, inventory: Item[]): number;
