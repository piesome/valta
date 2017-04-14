import { TypeManager } from "./TypeManager";
export declare class UnitType {
    name: string;
    health: number;
    damage: number;
    actions: string[];
    constructor(name: string, health: number, damage: number, actions: string[]);
}
export declare class UnitTypeManager extends TypeManager<UnitType> {
    constructor();
    transformRaw(data: any): UnitType;
}
