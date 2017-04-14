import * as GS from "./GameState";
import { TerrainType } from "./TerrainType";
import { Game } from "./Game";
import { Unit } from "./Unit";
export declare class TerrainSegment {
    id: GS.ID;
    type: TerrainType;
    x: number;
    y: number;
    z: number;
    units: Unit[];
    constructor(id: GS.ID, type: TerrainType, x: number, y: number, z: number, units: Unit[]);
    static deserialize(game: Game, data: GS.TerrainSegment): TerrainSegment;
    serialize(): GS.TerrainSegment;
}
