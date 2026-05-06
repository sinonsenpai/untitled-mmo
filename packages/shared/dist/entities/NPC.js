export function createNPC(id, name, x, y, dialogue) {
    return { id, name, position: { x, y }, dialogue };
}
