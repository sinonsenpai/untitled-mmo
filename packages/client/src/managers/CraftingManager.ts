import {
  getRecipeById,
  getRecipesForSkill,
  canCraft,
  getMaxCraftableCount,
  removeItemFromInventory,
  addItemToInventory,
  canAddItemToInventory,
  getItem,
  type Recipe,
} from '@rpg/shared';
import { gameState } from './GameStateManager.js';
import { inventoryManager } from './InventoryManager.js';
import { skillManager } from './SkillManager.js';
import { uiManager } from './UIManager.js';
import { questManager } from './QuestManager.js';

export class CraftingManager {
  private isCrafting: boolean = false;
  private craftProgress: number = 0;
  private craftSpeed: number = 0.015;
  private currentRecipe: Recipe | null = null;
  private currentSkillType: 'smithing' | 'fletching' | null = null;
  private craftInterval: ReturnType<typeof setInterval> | null = null;
  private pendingCraftAll: number = 0;
  private onCraftAllComplete: (() => void) | null = null;

  openCrafting(skillType: 'smithing' | 'fletching') {
    this.currentSkillType = skillType;
    gameState['emit']('craftingOpen', skillType);
  }

  getCurrentSkillType(): 'smithing' | 'fletching' | null {
    return this.currentSkillType;
  }

  craft(recipeId: string, onComplete?: () => void): boolean {
    if (this.isCrafting) return false;
    const recipe = getRecipeById(recipeId);
    if (!recipe) return false;
    if (!this.canCraftRecipe(recipeId)) return false;

    this.isCrafting = true;
    this.currentRecipe = recipe;
    this.craftProgress = 0;

    this.craftInterval = setInterval(() => {
      this.craftProgress += this.craftSpeed;
      if (this.craftProgress >= 1) {
        this.completeCraft(recipe);
        if (onComplete) onComplete();
      }
    }, 50);

    return true;
  }

  craftAll(recipeId: string, onComplete?: () => void): number {
    if (this.isCrafting) return 0;
    const recipe = getRecipeById(recipeId);
    if (!recipe) return 0;
    const count = this.getMaxCraftable(recipeId);
    if (count === 0) return 0;

    this.pendingCraftAll = count;
    this.onCraftAllComplete = onComplete || null;

    const craftNext = () => {
      if (this.pendingCraftAll <= 0) {
        if (this.onCraftAllComplete) {
          this.onCraftAllComplete();
          this.onCraftAllComplete = null;
        }
        return;
      }
      const stillCanCraft = this.canCraftRecipe(recipeId);
      if (!stillCanCraft) {
        if (this.onCraftAllComplete) {
          this.onCraftAllComplete();
          this.onCraftAllComplete = null;
        }
        return;
      }
      this.pendingCraftAll--;
      this.craft(recipeId, craftNext);
    };

    craftNext();
    return count;
  }

  private completeCraft(recipe: Recipe) {
    if (this.craftInterval) {
      clearInterval(this.craftInterval);
      this.craftInterval = null;
    }

    const player = gameState.getState().player;
    const outputItem = getItem(recipe.output.itemId);
    if (!outputItem) return;

    const output = {
      ...outputItem,
      quantity: recipe.output.quantity,
    };

    let inventoryAfterIngredients = player.inventory;
    for (const ing of recipe.ingredients) {
      inventoryAfterIngredients = removeItemFromInventory(
        inventoryAfterIngredients,
        ing.itemId,
        ing.quantity
      );
    }

    if (!canAddItemToInventory(inventoryAfterIngredients, output)) {
      gameState.addChatMessage('System', `You don't have enough inventory space to craft ${recipe.name.toLowerCase()}.`);
      this.isCrafting = false;
      this.craftProgress = 0;
      this.currentRecipe = null;
      return;
    }

    player.inventory = addItemToInventory(inventoryAfterIngredients, output);

    skillManager.addXp(recipe.skill, recipe.xp);
    gameState['emit']('inventory', player.inventory);

    gameState.addChatMessage(
      'System',
      `You craft a ${recipe.name.toLowerCase()}. (+${recipe.xp} ${
        recipe.skill.charAt(0).toUpperCase() + recipe.skill.slice(1)
      } XP)`
    );

    questManager.recordProgress(recipe.output.itemId, recipe.output.quantity);

    this.isCrafting = false;
    this.craftProgress = 0;
    this.currentRecipe = null;
  }

  getAvailableRecipes(skillType: 'smithing' | 'fletching'): Recipe[] {
    return getRecipesForSkill(skillType);
  }

  canCraftRecipe(recipeId: string): boolean {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return false;
    const player = gameState.getState().player;
    return canCraft(recipe, player.inventory, player.skills);
  }

  getMaxCraftable(recipeId: string): number {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return 0;
    const player = gameState.getState().player;
    return getMaxCraftableCount(recipe, player.inventory);
  }

  isCurrentlyCrafting(): boolean {
    return this.isCrafting;
  }

  getProgress(): number {
    return this.craftProgress;
  }

  getCurrentRecipe(): Recipe | null {
    return this.currentRecipe;
  }

  stopCrafting() {
    if (this.craftInterval) {
      clearInterval(this.craftInterval);
      this.craftInterval = null;
    }
    this.isCrafting = false;
    this.craftProgress = 0;
    this.currentRecipe = null;
    this.pendingCraftAll = 0;
    this.onCraftAllComplete = null;
  }
}

export const craftingManager = new CraftingManager();
