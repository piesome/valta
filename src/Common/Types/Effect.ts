export interface EffectTarget {
    unitType?: string;
    field?: string;
}

export interface Effect {
    name: string;
    type: string;
    target: EffectTarget;
    amount: number;
}

export interface EffectsFor {
    effectsFor(target: EffectTarget): Effect[];
}

export function calculateValue(faction: EffectsFor, target: EffectTarget, baseValue: number): number {
    const effects = faction.effectsFor(target);
    let constant = 0;
    let multiplier = 1;

    for (const improvement of effects) {
        if (improvement.type === "multiplier") {
            multiplier += improvement.amount;
        }
        if (improvement.type === "constant") {
            constant += improvement.amount;
        }
    }

    return (baseValue + constant) * multiplier;
}

export function unlocked(faction: EffectsFor, target: EffectTarget): boolean {
    const effects = faction.effectsFor(target);

    for (const improvement of effects) {
        if (improvement.type === "unlock") {
            return true;
        }
    }

    return false;
}
