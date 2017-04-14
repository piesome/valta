import * as GS from "./GameState";
import { Game } from "./Game";
import { Faction } from "./Faction";
import { UnitType } from "./UnitType";
export declare class Unit {
    id: GS.ID;
    type: UnitType;
    faction: Faction;
    currentHealth: number;
    constructor(id: GS.ID, type: UnitType, faction: Faction, currentHealth: number);
    static deserialize(game: Game, data: GS.Unit): Unit;
    serialize(): GS.Unit;
}
