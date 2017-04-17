import {v4 as uuid} from "uuid";
import * as EE from "events";

import * as GS from "./GameState";
import {Types} from "./Types";
import {
    Faction,
    TerrainSegment
} from "./Models";

export class Game extends EE {
    public types: Types;

    private terrain: {[x: number]: {[y: number]: {[z: number]: TerrainSegment}}};
    private factions: Faction[];

    constructor(
        types?: Types
    ) {
        super();

        this.terrain = {};
        this.factions = [];

        this.types = types || new Types();
    }

    public createFaction(factionType: string): Faction {
        const type = this.types.faction.getType(factionType);
        const faction = new Faction(
            uuid(),
            type,
            false,
            this.types.upgrade.automaticallyUnlocked()
        );

        this.addFaction(faction);

        return faction;
    }

    public addFaction(faction: Faction): Faction {
        this.factions.push(faction);

        return faction;
    }

    public getFaction(id: GS.ID) {
        return this.factions.filter((x) => x.id === id)[0];
    }

    public addTerrain(terrain: TerrainSegment) {
        if (!this.terrain[terrain.x]) {
            this.terrain[terrain.x] = {};
        }

        if (!this.terrain[terrain.x][terrain.y]) {
            this.terrain[terrain.x][terrain.y] = {};
        }

        this.terrain[terrain.x][terrain.y][terrain.z] = terrain;
    }

    public async load() {
        try {
            await this.types.load();
        } catch (err) {
            throw err;
        }
    }

    public deserialize(data: GS.GameState) {
        this.factions = data.factions.map((x) => Faction.deserialize(this, x));
        this.deserializeTerrain(data.terrain);
    }

    public serialize(): GS.GameState {
        return {
            factions: this.factions.map((x) => x.serialize()),
            terrain: this.serializeTerrain()
        };
    }

    private serializeTerrain(): GS.TerrainData {
        const terrain: GS.TerrainData = {};

        for (const xkey in this.terrain) {
            terrain[xkey] = {};
            for (const ykey in this.terrain[xkey]) {
                terrain[xkey][ykey] = {};
                for (const zkey in this.terrain[xkey][ykey]) {
                    terrain[xkey][ykey][zkey] = this.terrain[xkey][ykey][zkey].serialize();
                }
            }
        }

        return terrain;
    }

    private deserializeTerrain(data: GS.TerrainData) {
        this.terrain = {};

        for (const xkey in data) {
            for (const ykey in data[xkey]) {
                for (const zkey in data[xkey][ykey]) {
                    const terrain = TerrainSegment.deserialize(this, data[xkey][ykey][zkey]);
                    this.addTerrain(terrain);
                }
            }
        }
    }

}
