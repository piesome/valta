import * as GS from "./GameState";
import { FactionType } from "./FactionType";
import { Game } from "./Game";
export declare class Faction {
    id: GS.ID;
    type: FactionType;
    canAct: boolean;
    constructor(id: GS.ID, type: FactionType, canAct: boolean);
    static deserialize(game: Game, data: GS.Faction): Faction;
    serialize(): GS.Faction;
}
