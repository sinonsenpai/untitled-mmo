import type { NPCData } from '../types/index.js';

export function createNPC(
  id: string,
  name: string,
  x: number,
  y: number,
  dialogue: string[]
): NPCData {
  return { id, name, position: { x, y }, dialogue };
}
