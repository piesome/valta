import { TypeManager } from "./TypeManager";
export declare class TerrainType {
    name: string;
    movementPenalty: number;
    constructor(name: string, movementPenalty: number);
}
/**
 * Singleton for managing TerrainType
 */
export declare class TerrainTypeManager extends TypeManager<TerrainType> {
    constructor();
    transformRaw(data: any): TerrainType;
}
