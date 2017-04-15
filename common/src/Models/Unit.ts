import * as GS from "../GameState";
import {Game} from "../Game";
import {UnitType} from "../Types";

import {Faction} from "./Faction";

export class Unit {
    constructor(
        public id: GS.ID,
        public type: UnitType,
        public faction: Faction,
        public currentHealth: number
    ) {}

    get maximumHealth() {
        return this.type.getMaximumHealth(this.faction);
    }

    get damage() {
        return this.type.getDamage(this.faction);
    }

    static deserialize(game: Game, data: GS.Unit): Unit {
        return new Unit(
            data.id,
            game.types.unit.getType(data.unitType),
            game.getFaction(data.faction),
            data.currentHealth,
        );
    }

    public serialize(): GS.Unit {
        return {
            id: this.id,
            faction: this.faction.id,
            currentHealth: this.currentHealth,
            unitType: null
        };
    }
}


