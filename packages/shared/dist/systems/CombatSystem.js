export function calculateMaxHit(strengthLevel, strengthBonus) {
    return Math.floor(0.5 + (strengthLevel * (strengthBonus + 64)) / 640);
}
export function calculateAccuracyRoll(attackLevel, attackBonus) {
    return attackLevel * (attackBonus + 64);
}
export function calculateDefenceRoll(defenceLevel, defenceBonus) {
    return defenceLevel * (defenceBonus + 64);
}
export function rollHit(accuracyRoll, defenceRoll) {
    const hitChance = accuracyRoll / (accuracyRoll + defenceRoll);
    return Math.random() < hitChance;
}
export function rollDamage(maxHit) {
    return Math.floor(Math.random() * (maxHit + 1));
}
export function rollDrop(dropTable) {
    const drops = [];
    if (dropTable.always) {
        drops.push(...dropTable.always);
    }
    function rollRarity(items, baseChance) {
        if (!items)
            return;
        for (const drop of items) {
            const chance = drop.chance ?? baseChance;
            if (Math.random() < chance) {
                drops.push({ itemId: drop.itemId, quantity: drop.quantity });
            }
        }
    }
    rollRarity(dropTable.common, 0.5);
    rollRarity(dropTable.uncommon, 0.1);
    rollRarity(dropTable.rare, 0.01);
    return drops;
}
export function getCombatLevel(stats) {
    const base = (stats.defence + stats.hp) * 0.25;
    const melee = (stats.attack + stats.strength) * 0.325;
    return Math.floor(base + melee);
}
export function getEquipmentBonus(equipment, style) {
    let bonus = 0;
    for (const item of Object.values(equipment)) {
        if (!item?.stats)
            continue;
        switch (style) {
            case 'accurate':
                bonus += item.stats.attackBonus ?? 0;
                break;
            case 'aggressive':
                bonus += item.stats.strengthBonus ?? 0;
                break;
            case 'defensive':
                bonus += item.stats.defenceBonus ?? 0;
                break;
        }
    }
    return bonus;
}
