export function calculateMeleeDamage(
  attackLevel: number,
  strengthLevel: number,
  equipmentBonus: number = 0
): number {
  const base = Math.floor(
    0.5 + (attackLevel * (strengthLevel + equipmentBonus)) / 64
  );
  const variance = Math.random() * 0.2 + 0.9;
  return Math.max(0, Math.floor(base * variance));
}

export function calculateMaxHp(level: number): number {
  return level;
}
