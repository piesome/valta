import {EventEmitter} from "eventemitter3";

import {Game} from "../Game";
import * as GS from "../GameState";
import {Hex} from "../Util/Hex";

import {Faction} from "./Faction";
import {TerrainSegment} from "./TerrainSegment";

export class City extends EventEmitter {
    public static deserialize(game: Game, data: GS.ICity): City {
        return new City(
            data.id,
            data.name,
            game.getFaction(data.faction),
            game.getTerrain(data.terrain),
            data.currentHealth,
            data.currentEnergy,
            data.owns.map((hex) => Hex.deserializeHex(hex)),
        );
    }

    public maximumEnergy = 1;
    public maximumHealth = 100;

    constructor(
        public id: GS.ID,
        public name: string,
        public faction: Faction,
        public terrain: TerrainSegment,
        public currentHealth: number,
        public currentEnergy: number,
        public owns: Hex[],
    ) {
        super();

        if (this.terrain) {
            this.terrain.city = this;
        }
    }

    public resetEnergy() {
        this.currentEnergy = this.maximumEnergy;
    }

    public serialize(): GS.ICity {
        return {
            buildings: [],
            currentEnergy: this.currentEnergy,
            currentHealth: this.currentHealth,
            faction: this.faction.id,
            id: this.id,
            name: this.name,
            owns: this.owns.map((hex) => hex.serializeHex()),
            productionQueue: [],
            terrain: this.terrain.id,
        };
    }
}
