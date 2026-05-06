export function createDefaultPlayer(name) {
    return {
        name,
        position: { x: 10, y: 10 },
        hp: 10,
        maxHp: 10,
        skills: {
            hp: { name: 'Hitpoints', level: 10, xp: 1154, maxLevel: 99 },
            attack: { name: 'Attack', level: 1, xp: 0, maxLevel: 99 },
            strength: { name: 'Strength', level: 1, xp: 0, maxLevel: 99 },
            defence: { name: 'Defence', level: 1, xp: 0, maxLevel: 99 },
            woodcutting: { name: 'Woodcutting', level: 1, xp: 0, maxLevel: 99 },
            mining: { name: 'Mining', level: 1, xp: 0, maxLevel: 99 },
            smithing: { name: 'Smithing', level: 1, xp: 0, maxLevel: 99 },
            fletching: { name: 'Fletching', level: 1, xp: 0, maxLevel: 99 },
            firemaking: { name: 'Firemaking', level: 1, xp: 0, maxLevel: 99 },
        },
        inventory: [],
        equipment: {},
        bank: [],
        bankCapacity: 400,
        gold: 0,
    };
}
export function addItemToInventory(inventory, item) {
    const existing = inventory.find((i) => i.id === item.id && i.quantity < i.maxStack);
    if (existing && item.quantity + existing.quantity <= existing.maxStack) {
        existing.quantity += item.quantity;
        return [...inventory];
    }
    if (inventory.length >= 28)
        return inventory;
    return [...inventory, { ...item }];
}
export function removeItemFromInventory(inventory, itemId, amount = 1) {
    const idx = inventory.findIndex((i) => i.id === itemId);
    if (idx === -1)
        return inventory;
    const copy = [...inventory];
    if (copy[idx].quantity <= amount) {
        copy.splice(idx, 1);
    }
    else {
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity - amount };
    }
    return copy;
}
export function equipItem(equipment, item) {
    if (!item.slot)
        return equipment;
    return { ...equipment, [item.slot]: item };
}
export function unequipItem(equipment, slot) {
    const copy = { ...equipment };
    delete copy[slot];
    return copy;
}
