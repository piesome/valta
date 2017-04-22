import * as EE from "events";
import * as R from "ramda";
import {v4 as uuid} from "uuid";

import * as GS from "./GameState";
import {
    Faction,
    TerrainSegment,
} from "./Models";
import {Types} from "./Types";

export class Game extends EE {
    public types: Types;

    protected tick: number;
    protected terrain: {[x: number]: {[y: number]: {[z: number]: TerrainSegment}}};
    protected factions: Faction[];

    constructor(
        types?: Types,
    ) {
        super();

        this.tick = 0;
        this.terrain = {};
        this.factions = [];

        this.types = types || new Types();
    }

    public endTurn() {
        const orderedFactions = R.sortBy((faction) => faction.order, this.factions);
        const currentTurn = R.find((faction) => faction.canAct, orderedFactions);

        R.map((faction) => faction.canAct = false, this.factions);

        if (!currentTurn || currentTurn.order === orderedFactions.length - 1) {
            this.getFaction(orderedFactions[0].id).canAct = true;
        } else {
            this.getFaction(orderedFactions[currentTurn.order + 1].id).canAct = true;
        }

        this.tick += 1;
        this.emit("update");
    }

    public createFaction(peerId: GS.ID, factionType: GS.FactionType): Faction {
        const type = this.types.faction.getType(factionType);
        const faction = new Faction(
            uuid(),
            type,
            false,
            this.types.upgrade.automaticallyUnlocked(),
            peerId,
            this.factions.length,
        );

        this.factions.push(faction);

        return faction;
    }

    public getFaction(id: GS.ID) {
        return this.factions.filter((x) => x.id === id)[0];
    }

    public getFactionByPeerId(peerId: GS.ID) {
        return this.factions.filter((x) => x.peerId === peerId)[0];
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

    public deserialize(data: GS.IGameState) {
        this.tick = data.tick;
        this.factions = data.factions.map((x) => Faction.deserialize(this, x));
        this.deserializeTerrain(data.terrain);
    }

    public serialize(): GS.IGameState {
        return {
            factions: this.factions.map((x) => x.serialize()),
            terrain: this.serializeTerrain(),
            tick: this.tick,
        };
    }

    private serializeTerrain(): GS.ITerrainData {
        const terrain: GS.ITerrainData = {};

        for (const xkey in this.terrain) {
            if (!this.terrain.hasOwnProperty(xkey)) {
                continue;
            }

            terrain[xkey] = {};
            for (const ykey in this.terrain[xkey]) {
                if (!this.terrain[xkey].hasOwnProperty(ykey)) {
                    continue;
                }

                terrain[xkey][ykey] = {};
                for (const zkey in this.terrain[xkey][ykey]) {
                    if (!this.terrain[xkey][ykey].hasOwnProperty(zkey)) {
                        continue;
                    }

                    terrain[xkey][ykey][zkey] = this.terrain[xkey][ykey][zkey].serialize();
                }
            }
        }

        return terrain;
    }

    private deserializeTerrain(data: GS.ITerrainData) {
        this.terrain = {};

        for (const xkey in data) {
            if (!data.hasOwnProperty(xkey)) {
                continue;
            }

            for (const ykey in data[xkey]) {
                if (!data[xkey].hasOwnProperty(ykey)) {
                    continue;
                }

                for (const zkey in data[xkey][ykey]) {
                    if (!data[xkey][ykey].hasOwnProperty(zkey)) {
                        continue;
                    }

                    const terrain = TerrainSegment.deserialize(this, data[xkey][ykey][zkey]);
                    this.addTerrain(terrain);
                }
            }
        }
    }

}
