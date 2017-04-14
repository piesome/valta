import {v4 as uuid} from "uuid";

import * as GS from "./GameState";
import {
    FactionTypeManager,
    TerrainTypeManager,
    UnitTypeManager
} from "./Types";
import {
    Faction,
    TerrainSegment
} from "./Models";

export class Game {
    public factionTypes: FactionTypeManager;
    public terrainTypes: TerrainTypeManager;
    public unitTypes: UnitTypeManager;

    private terrain: {[x: number]: {[y: number]: {[z: number]: TerrainSegment}}};
    private factions: Faction[];

    constructor(
        factionTypes?: FactionTypeManager,
        terrainTypes?: TerrainTypeManager,
        unitTypes?: UnitTypeManager
    ) {
        this.terrain = [];

        this.factionTypes = factionTypes || new FactionTypeManager();
        this.terrainTypes = terrainTypes || new TerrainTypeManager();
        this.unitTypes = unitTypes || new UnitTypeManager();
    }

    public getFaction(id: GS.ID) {
        return this.factions.filter((x) => x.id === id)[0];
    }

    public async load() {
        try {
            await this.factionTypes.load();
            await this.terrainTypes.load();

            this.generateRandomTerrain();
            this.factions = [
                new Faction(uuid(), this.factionTypes.getType("faction-1"), true),
                new Faction(uuid(), this.factionTypes.getType("faction-2"), true)
            ];
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

    private addTerrain(terrain: TerrainSegment) {
        if (!this.terrain[terrain.x]) {
            this.terrain[terrain.x] = {};
        }

        if (!this.terrain[terrain.x][terrain.y]) {
            this.terrain[terrain.x][terrain.y] = {};
        }

        this.terrain[terrain.x][terrain.y][terrain.z] = terrain;
    }

    private generateRandomTerrain() {
        const n = 3;
        for (let dx = -n; dx <= n; dx++) {
            for (let dy = Math.max(-n, -dx - n); dy <= Math.min(n, -dx + n); dy++) {
                const dz = -dx - dy;

                const terrain = new TerrainSegment(
                    uuid(),
                    this.terrainTypes.getType("plains"),
                    dx,
                    dy,
                    dz,
                    []
                );

                this.addTerrain(terrain);
            }
        }
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
