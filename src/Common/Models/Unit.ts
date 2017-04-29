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
            data.currentEnergy,
        );
    }

    constructor(
        public id: GS.ID,
        public type: UnitType,
        public faction: Faction,
        public currentHealth?: number,
        public currentEnergy?: number,
    ) {
        if (currentHealth === undefined) {
            this.currentHealth = this.maximumHealth;
        }
        if (currentEnergy === undefined) {
            this.currentEnergy = this.maximumEnergy;
        }
    }

    public get maximumHealth() {
        return this.type.getMaximumHealth(this.faction);
    }

    public get maximumEnergy() {
        return this.type.getMaximumEnergy(this.faction);
    }

    public get damage() {
        return this.type.getDamage(this.faction);
    }

    public serialize(): GS.IUnit {
        return {
            currentEnergy: this.currentEnergy,
            currentHealth: this.currentHealth,
            faction: this.faction.id,
            id: this.id,
            unitType: this.type.name,
        };
    }
}
