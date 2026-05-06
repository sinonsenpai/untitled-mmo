export const ITEM_DATABASE = {
    'logs': { id: 'logs', name: 'Logs', quantity: 1, maxStack: 999 },
    'oak_logs': { id: 'oak_logs', name: 'Oak logs', quantity: 1, maxStack: 999 },
    'copper_ore': { id: 'copper_ore', name: 'Copper ore', quantity: 1, maxStack: 999 },
    'tin_ore': { id: 'tin_ore', name: 'Tin ore', quantity: 1, maxStack: 999 },
    'bronze_bar': { id: 'bronze_bar', name: 'Bronze bar', quantity: 1, maxStack: 999 },
    'bronze_dagger': { id: 'bronze_dagger', name: 'Bronze dagger', quantity: 1, maxStack: 1, slot: 'weapon' },
    'bronze_helm': { id: 'bronze_helm', name: 'Bronze full helm', quantity: 1, maxStack: 1, slot: 'head' },
    'wooden_shield': { id: 'wooden_shield', name: 'Wooden shield', quantity: 1, maxStack: 1, slot: 'shield' },
    'shrimp': { id: 'shrimp', name: 'Raw shrimp', quantity: 1, maxStack: 999 },
};
export function getItem(id) {
    const template = ITEM_DATABASE[id];
    if (!template)
        return undefined;
    return { ...template };
}
