export function createQuest(id, name, description, objectives) {
    return {
        id,
        name,
        description,
        state: 'not_started',
        objectives: objectives.map((o) => ({ ...o, current: 0 })),
        rewards: {},
    };
}
export function startQuest(quest) {
    if (quest.state !== 'not_started')
        return quest;
    return { ...quest, state: 'in_progress' };
}
export function updateObjective(quest, target, amount = 1) {
    if (quest.state !== 'in_progress')
        return quest;
    const objectives = quest.objectives.map((obj) => {
        if (obj.target === target) {
            return { ...obj, current: Math.min(obj.current + amount, obj.amount) };
        }
        return obj;
    });
    const allComplete = objectives.every((obj) => obj.current >= obj.amount);
    return {
        ...quest,
        objectives,
        state: allComplete ? 'completed' : 'in_progress',
    };
}
