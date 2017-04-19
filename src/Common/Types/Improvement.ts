export interface ImprovementTarget {
    unitType?: string;
    field?: string;
}

export interface Improvement {
    name: string;
    type: string;
    target: ImprovementTarget;
    amount: number;
}

export interface ImprovementsFor {
    improvementsFor(target: ImprovementTarget): Improvement[];
}

export function calculateValue(faction: ImprovementsFor, target: ImprovementTarget, baseValue: number): number {
    const improvements = faction.improvementsFor(target);
    let constant = 0;
    let multiplier = 1;

    for (const improvement of improvements) {
        if (improvement.type === "multiplier") {
            multiplier += improvement.amount;
        }
        if (improvement.type === "constant") {
            constant += improvement.amount;
        }
    }

    return (baseValue + constant) * multiplier;
}

export function unlocked(faction: ImprovementsFor, target: ImprovementTarget): boolean {
    const improvements = faction.improvementsFor(target);

    for (const improvement of improvements) {
        if (improvement.type === "unlock") {
            return true;
        }
    }

    return false;
}
