import {EventEmitter} from "eventemitter3";

import {Game} from "../Game";
import * as GS from "../GameState";
import {Hex} from "../Util/Hex";

import {Faction} from "./Faction";
import {NaturalResources} from "./NaturalResources";
import {ProductionQueue} from "./ProductionQueue";
import {TerrainSegment} from "./TerrainSegment";

export class City extends EventEmitter {
    public static deserialize(game: Game, data: GS.ICity): City {
        return new City(
            game,
            data.id,
            data.name,
            game.getFaction(data.faction),
            game.getTerrain(data.terrain),
            data.currentHealth,
            data.currentEnergy,
            data.owns.map((hex) => Hex.deserializeHex(hex)),
            ProductionQueue.deserialize(game, data.productionQueue),
            NaturalResources.deserialize(data.resources),
        );
    }

    public maximumEnergy = 1;
    public maximumHealth = 100;

    public productionQueue: ProductionQueue;
    public resources: NaturalResources;

    constructor(
        private game: Game,
        public id: GS.ID,
        public name: string,
        public faction: Faction,
        public terrain: TerrainSegment,
        public currentHealth: number,
        public currentEnergy: number,
        public owns: Hex[],
        productionQueue?: ProductionQueue,
        resources?: NaturalResources,
    ) {
        super();

        if (this.terrain) {
            this.terrain.city = this;
        }

        if (!productionQueue) {
            productionQueue = new ProductionQueue();
        }
        this.productionQueue = productionQueue;

        if (!resources) {
            resources = new NaturalResources();
        }
        this.resources = resources;

        this.on("added", this.onAdded.bind(this));
        this.on("removed", this.onRemoved.bind(this));
        this.on("tick", this.onTick.bind(this));
    }

    public * ownedTiles() {
        for (const hex of this.owns) {
            const terrain = this.game.getTerrainSegmentByHex(hex);
            if (terrain) {
                yield terrain;
            }
        }
    }

    public resetEnergy() {
        this.currentEnergy = this.maximumEnergy;
    }

    public readyToProduce() {
        this.resources = this.productionQueue.takeResources(this.resources);
        return this.productionQueue.isReady();
    }

    public canBeAdded() {
        for (const terrain of this.ownedTiles()) {
            if (terrain.ownedBy && terrain.ownedBy.faction.id !== this.faction.id) {
                return false;
            }
        }

        return true;
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
            productionQueue: this.productionQueue.serialize(),
            resources: this.resources.serialize(),
            terrain: this.terrain.id,
        };
    }

    private onAdded() {
        for (const terrain of this.ownedTiles()) {
            terrain.ownedBy = this;
        }
    }

    private onRemoved() {
        for (const terrain of this.ownedTiles()) {
            terrain.ownedBy = null;
        }
    }

    private onTick() {
        if (!this.faction.canAct) {
            return;
        }

        let resources = new NaturalResources();
        for (const terrain of this.ownedTiles()) {
            resources = resources.add(terrain.naturalResources);
        }
        this.resources = resources;

        if (!this.readyToProduce()) {
            return;
        }

        const unitType = this.productionQueue.pop();
        const unit = this.game.createUnit(unitType.name, this.faction);
        this.game.moveUnitTo(unit, this.terrain);
    }
}
