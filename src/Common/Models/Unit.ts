import {Game} from "../Game";
import * as GS from "../GameState";
import {UnitType} from "../Types";

import {Faction} from "./Faction";

export class Unit {
    public static deserialize(game: Game, data: GS.IUnit): Unit {
        return new Unit(
            data.id,
            game.types.unit.getType(data.unitType),
            game.getFaction(data.faction),
            data.currentHealth,
        );
    }

    constructor(
        public id: GS.ID,
        public type: UnitType,
        public faction: Faction,
        public currentHealth: number,
    ) {}

    public get maximumHealth() {
        return this.type.getMaximumHealth(this.faction);
    }

    public get damage() {
        return this.type.getDamage(this.faction);
    }

    public serialize(): GS.IUnit {
        return {
            currentHealth: this.currentHealth,
            faction: this.faction.id,
            id: this.id,
            unitType: null,
        };
    }
}
