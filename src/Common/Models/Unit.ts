import {EventEmitter} from "eventemitter3";

import {Game} from "../Game";
import * as GS from "../GameState";
import {UnitType} from "../Types";

import {Faction} from "./Faction";
import {TerrainSegment} from "./TerrainSegment";

export class Unit extends EventEmitter {
    public static deserialize(game: Game, data: GS.IUnit): Unit {
        return new Unit(
            data.id,
            game.types.unit.getType(data.unitType),
            game.getFaction(data.faction),
            game.getTerrain(data.terrain),
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
        public terrain: TerrainSegment,
        currentHealth?: number,
        currentEnergy?: number,
    ) {
        super();

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

        if (this.terrain) {
            this.terrain.addUnit(this);
        }
    }

    public moveTo(terrain: TerrainSegment) {
        if (!terrain.canUnitBeAdded(this)) {
            throw new Error("Unit can't be added there");
        }

        if (this.terrain) {
            this.terrain.removeUnit(this);
        }
        terrain.addUnit(this);
        this.terrain = terrain;
    }

    public kill() {
        if (this.terrain) {
            this.terrain.removeUnit(this);
        }
        this.emit("dead");
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
        if (this.currentHealth <= 0) {
            this.kill();
        }
    }

    public serialize(): GS.IUnit {
        return {
            currentEnergy: this.currentEnergy,
            currentHealth: this.currentHealth,
            faction: this.faction.id,
            id: this.id,
            terrain: this.terrain.id,
            unitType: this.type.name,
        };
    }
}
