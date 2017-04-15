export interface ImprovementTarget {
    unitType?: string;
    value?: string;
}

export interface Improvement {
    name: string;
    type: string;
    target: ImprovementTarget;
    amount: number;
}
