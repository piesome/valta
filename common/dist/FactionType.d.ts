import { TypeManager } from "./TypeManager";
export declare class FactionType {
    name: string;
    constructor(name: string);
}
/**
 * Singleton for managing FactionTypes
 */
export declare class FactionTypeManager extends TypeManager<FactionType> {
    constructor();
    transformRaw(data: any): FactionType;
}
