export interface IEffectTarget {
    unitType?: string;
    field?: string;
}

export interface IEffect {
    name: string;
    type: string;
    target: IEffectTarget;
    amount: number;
}

export interface IEffectsFor {
    effectsFor(target: IEffectTarget): IEffect[];
}

export function calculateValue(faction: IEffectsFor, target: IEffectTarget, baseValue: number): number {
    const effects = faction.effectsFor(target);
    let constant = 0;
    let multiplier = 1;

    for (const effect of effects) {
        if (effect.type === "multiplier") {
            multiplier += effect.amount;
        }
        if (effect.type === "constant") {
            constant += effect.amount;
        }
    }
    return (baseValue + constant) * multiplier;
}

export function unlocked(faction: IEffectsFor, target: IEffectTarget): boolean {
    const effects = faction.effectsFor(target);

    for (const improvement of effects) {
        if (improvement.type === "unlock") {
            return true;
        }
    }

    return false;
}
