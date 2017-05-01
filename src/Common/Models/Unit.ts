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

    public currentHealth: number;
    public currentEnergy: number;

    constructor(
        public id: GS.ID,
        public type: UnitType,
        public faction: Faction,
        currentHealth?: number,
        currentEnergy?: number,
    ) {
        if ((typeof currentHealth) === "undefined") {
            this.currentHealth = this.maximumHealth;
        } else {
            this.currentHealth = currentHealth;
        }

        if ((typeof currentEnergy) === "undefined") {
            this.currentEnergy = this.maximumEnergy;
        } else {
            this.currentEnergy = currentEnergy;
        }
    }

    public resetEnergy() {
        this.currentEnergy = this.maximumEnergy;
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

    public takeDamage(damage: number) {
        this.currentHealth = (damage >= this.currentHealth ? 0 : this.currentHealth - damage);
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
