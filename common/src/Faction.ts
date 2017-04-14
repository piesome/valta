import * as GS from "./GameState";
import {FactionType} from "./FactionType";
import {Game} from "./Game";

export class Faction {
    constructor(
        public id: GS.ID,
        public type: FactionType,
        public canAct: boolean
    ) {}

    static deserialize(game: Game, data: GS.Faction): Faction {
        return new Faction(
            data.id,
            game.factionTypes.getType(data.factionType),
            data.canAct
        );
    }

    public serialize(): GS.Faction {
        return {
            id: this.id,
            factionType: this.type.name,
            canAct: this.canAct,
            unlockedTechnologies: []
        };
    }
}
