import { UIPanel } from './UIPanel.js';
import { craftingManager } from '../managers/CraftingManager.js';
import { gameState } from '../managers/GameStateManager.js';
import { uiManager } from '../managers/UIManager.js';
import {
  getRecipesForSkill,
  canCraft,
  countItemInInventory,
  getMaxCraftableCount,
  type Recipe,
} from '@rpg/shared';

export class CraftingPanel extends UIPanel {
  private selectedRecipeId: string | null = null;
  private currentSkillType: 'smithing' | 'fletching' = 'smithing';

  constructor() {
    super('crafting', 'Crafting');
    this.container.style.width = '480px';
    this.container.style.top = '100px';
    this.container.style.left = '240px';

    this.render();

    gameState.on('inventory', () => this.render());
    gameState.on('skills', () => this.render());
    gameState.on('craftingOpen', (skillType: unknown) => {
      this.currentSkillType = skillType as 'smithing' | 'fletching';
      this.selectedRecipeId = null;
      this.render();
      uiManager.showPanel('crafting');
    });

    this.getContentDiv().addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const recipeEl = target.closest('[data-recipe-id]') as HTMLElement | null;
      const tabEl = target.closest('[data-tab]') as HTMLElement | null;
      const actionEl = target.closest('[data-action]') as HTMLElement | null;

      if (recipeEl?.dataset.recipeId) {
        this.selectedRecipeId = recipeEl.dataset.recipeId;
        this.render();
      }

      if (actionEl?.dataset.action === 'craft' && this.selectedRecipeId) {
        craftingManager.craft(this.selectedRecipeId, () => {
          this.render();
        });
      }

      if (actionEl?.dataset.action === 'craftAll' && this.selectedRecipeId) {
        craftingManager.craftAll(this.selectedRecipeId, () => {
          this.render();
        });
      }

      if (tabEl?.dataset.tab) {
        this.currentSkillType = tabEl.dataset.tab as 'smithing' | 'fletching';
        this.selectedRecipeId = null;
        this.render();
      }
    });
  }

  private render() {
    const content = this.getContentDiv();
    const player = gameState.getState().player;
    const recipes = getRecipesForSkill(this.currentSkillType);

    let html =
      '<div style="display:flex;gap:8px;height:340px;">';

    // Tabs
    html +=
      '<div style="display:flex;flex-direction:column;gap:4px;width:80px;">';
    html += this.makeTab('smithing', 'Smithing');
    html += this.makeTab('fletching', 'Fletching');
    html += '</div>';

    // Recipe list
    html +=
      '<div style="flex:1;overflow-y:auto;border:1px solid #4a4a5a;border-radius:3px;padding:4px;display:flex;flex-direction:column;gap:2px;">';
    for (const recipe of recipes) {
      html += this.makeRecipeRow(recipe, player);
    }
    html += '</div>';

    // Details
    html +=
      '<div style="width:180px;border:1px solid #4a4a5a;border-radius:3px;padding:8px;">';
    if (this.selectedRecipeId) {
      const recipe = recipes.find((r) => r.id === this.selectedRecipeId);
      if (recipe) {
        html += this.makeRecipeDetails(recipe, player);
      }
    } else {
      html +=
        '<div style="color:#888;font-size:11px;text-align:center;padding-top:40px;">Select a recipe</div>';
    }
    html += '</div>';

    html += '</div>';
    content.innerHTML = html;
  }

  private makeTab(tab: string, label: string): string {
    const active = this.currentSkillType === tab;
    return `<button data-tab="${tab}" style="
      padding:6px;
      background:${active ? '#4a9' : '#3a3a4a'};
      border:1px solid #5a5a6a;
      border-radius:3px;
      color:#fff;
      cursor:pointer;
      font-size:11px;
    ">${label}</button>`;
  }

  private makeRecipeRow(recipe: Recipe, player: any): string {
    const hasLevel =
      player.skills[recipe.skill]?.level >= recipe.levelRequired;
    const canCraftRecipe = canCraft(recipe, player.inventory, player.skills);

    let color = '#ccc';
    let bg = 'transparent';
    if (!hasLevel) {
      color = '#888';
    } else if (canCraftRecipe) {
      color = '#4a9';
      bg = 'rgba(74,170,153,0.1)';
    } else {
      color = '#c55';
      bg = 'rgba(204,85,85,0.1)';
    }

    const selected = this.selectedRecipeId === recipe.id;
    const border = selected ? '2px solid #ffcc00' : '1px solid #4a4a5a';

    return `<div data-recipe-id="${recipe.id}" style="
      padding:5px 8px;
      cursor:pointer;
      border-radius:3px;
      color:${color};
      background:${bg};
      border:${border};
      font-size:11px;
    ">${recipe.name} <span style="float:right;color:#888;">Lvl ${recipe.levelRequired}</span></div>`;
  }

  private makeRecipeDetails(recipe: Recipe, player: any): string {
    const canCraftRecipe = canCraft(recipe, player.inventory, player.skills);
    const maxCraftable = getMaxCraftableCount(recipe, player.inventory);

    let html = `<div style="font-weight:bold;margin-bottom:8px;">${recipe.name}</div>`;
    html += `<div style="font-size:11px;color:#888;margin-bottom:8px;">Level: ${recipe.levelRequired} | XP: ${recipe.xp}</div>`;

    html +=
      '<div style="margin-bottom:8px;font-size:11px;">Ingredients:</div>';
    html +=
      '<div style="display:flex;flex-direction:column;gap:3px;margin-bottom:12px;">';
    for (const ing of recipe.ingredients) {
      const have = countItemInInventory(player.inventory, ing.itemId);
      const color = have >= ing.quantity ? '#4a9' : '#c55';
      html += `<div style="font-size:11px;color:${color};">${ing.itemId.replace(/_/g, ' ')}: ${have}/${ing.quantity}</div>`;
    }
    html += '</div>';

    html += `<div style="font-size:11px;color:#888;margin-bottom:12px;">Output: ${recipe.output.itemId.replace(/_/g, ' ')} x${recipe.output.quantity}</div>`;

    const disabled = !canCraftRecipe
      ? 'opacity:0.5;cursor:not-allowed;'
      : 'cursor:pointer;';
    const disabledAttr = !canCraftRecipe ? 'disabled' : '';

    html += `<button data-action="craft" ${disabledAttr} style="
      width:100%;
      padding:6px;
      margin-bottom:6px;
      background:#3a3a4a;
      border:1px solid #5a5a6a;
      border-radius:3px;
      color:#fff;
      ${disabled}
    ">Craft</button>`;

    html += `<button data-action="craftAll" ${disabledAttr} style="
      width:100%;
      padding:6px;
      background:#3a3a4a;
      border:1px solid #5a5a6a;
      border-radius:3px;
      color:#fff;
      ${disabled}
    ">Craft All (${maxCraftable})</button>`;

    return html;
  }
}
