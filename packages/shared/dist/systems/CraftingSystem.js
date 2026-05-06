export const RECIPES = [
    // Smithing
    {
        id: 'bronze_bar',
        name: 'Bronze bar',
        skill: 'smithing',
        levelRequired: 1,
        ingredients: [
            { itemId: 'copper_ore', quantity: 1 },
            { itemId: 'tin_ore', quantity: 1 },
        ],
        output: { itemId: 'bronze_bar', quantity: 1 },
        xp: 12,
    },
    {
        id: 'bronze_dagger',
        name: 'Bronze dagger',
        skill: 'smithing',
        levelRequired: 1,
        ingredients: [{ itemId: 'bronze_bar', quantity: 1 }],
        output: { itemId: 'bronze_dagger', quantity: 1 },
        xp: 25,
    },
    {
        id: 'bronze_sword',
        name: 'Bronze sword',
        skill: 'smithing',
        levelRequired: 1,
        ingredients: [{ itemId: 'bronze_bar', quantity: 1 }],
        output: { itemId: 'bronze_sword', quantity: 1 },
        xp: 25,
    },
    {
        id: 'bronze_helm',
        name: 'Bronze helm',
        skill: 'smithing',
        levelRequired: 1,
        ingredients: [{ itemId: 'bronze_bar', quantity: 1 }],
        output: { itemId: 'bronze_helm', quantity: 1 },
        xp: 25,
    },
    {
        id: 'bronze_body',
        name: 'Bronze platebody',
        skill: 'smithing',
        levelRequired: 5,
        ingredients: [{ itemId: 'bronze_bar', quantity: 5 }],
        output: { itemId: 'bronze_body', quantity: 1 },
        xp: 62,
    },
    {
        id: 'bronze_legs',
        name: 'Bronze platelegs',
        skill: 'smithing',
        levelRequired: 3,
        ingredients: [{ itemId: 'bronze_bar', quantity: 3 }],
        output: { itemId: 'bronze_legs', quantity: 1 },
        xp: 37,
    },
    {
        id: 'bronze_arrowheads',
        name: 'Bronze arrowheads',
        skill: 'smithing',
        levelRequired: 1,
        ingredients: [{ itemId: 'bronze_bar', quantity: 1 }],
        output: { itemId: 'bronze_arrowhead', quantity: 15 },
        xp: 12,
    },
    // Fletching
    {
        id: 'arrow_shaft',
        name: 'Arrow shaft',
        skill: 'fletching',
        levelRequired: 1,
        ingredients: [{ itemId: 'logs', quantity: 1 }],
        output: { itemId: 'arrow_shaft', quantity: 15 },
        xp: 5,
    },
    {
        id: 'shortbow',
        name: 'Shortbow',
        skill: 'fletching',
        levelRequired: 5,
        ingredients: [
            { itemId: 'logs', quantity: 1 },
            { itemId: 'bowstring', quantity: 1 },
        ],
        output: { itemId: 'shortbow', quantity: 1 },
        xp: 10,
    },
    {
        id: 'bronze_arrow',
        name: 'Bronze arrow',
        skill: 'fletching',
        levelRequired: 1,
        ingredients: [
            { itemId: 'arrow_shaft', quantity: 1 },
            { itemId: 'feather', quantity: 1 },
            { itemId: 'bronze_arrowhead', quantity: 1 },
        ],
        output: { itemId: 'bronze_arrow', quantity: 10 },
        xp: 12,
    },
];
export function getRecipeById(id) {
    return RECIPES.find((r) => r.id === id);
}
export function getRecipesForSkill(skill) {
    return RECIPES.filter((r) => r.skill === skill);
}
export function countItemInInventory(inventory, itemId) {
    const item = inventory.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
}
export function hasIngredients(inventory, ingredients) {
    return ingredients.every((ing) => countItemInInventory(inventory, ing.itemId) >= ing.quantity);
}
export function canCraft(recipe, inventory, skills) {
    const hasLevel = skills[recipe.skill]?.level >= recipe.levelRequired;
    const hasMats = hasIngredients(inventory, recipe.ingredients);
    return hasLevel && hasMats;
}
export function getMaxCraftableCount(recipe, inventory) {
    if (!hasIngredients(inventory, recipe.ingredients))
        return 0;
    let max = Infinity;
    for (const ing of recipe.ingredients) {
        const count = countItemInInventory(inventory, ing.itemId);
        max = Math.min(max, Math.floor(count / ing.quantity));
    }
    return max === Infinity ? 0 : max;
}
