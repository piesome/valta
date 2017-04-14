import * as GS from "./GameState";
import { FactionTypeManager } from "./FactionType";
import { TerrainTypeManager } from "./TerrainType";
import { UnitTypeManager } from "./UnitType";
import { Faction } from "./Faction";
export declare class Game {
    factionTypes: FactionTypeManager;
    terrainTypes: TerrainTypeManager;
    unitTypes: UnitTypeManager;
    private terrain;
    private factions;
    constructor();
    getFaction(id: GS.ID): Faction;
    load(): Promise<void>;
    deserialize(data: GS.GameState): void;
    serialize(): GS.GameState;
    private addTerrain(terrain);
    private generateRandomTerrain();
    private serializeTerrain();
    private deserializeTerrain(data);
}
