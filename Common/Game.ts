import {inject, injectable} from "inversify";
import {v4 as uuid} from "uuid";

import * as GS from "./GameState";
import {FactionTypeManager} from "./FactionType";
import {TerrainTypeManager} from "./TerrainType";
import {TerrainSegment} from "./TerrainSegment";
import {Faction} from "./Faction";


@injectable()
export class Game {
    private terrain: TerrainSegment[][][];
    private factions: Faction[];

    constructor(
        @inject(FactionTypeManager) public factionTypes: FactionTypeManager,
        @inject(TerrainTypeManager) public terrainTypes: TerrainTypeManager
    ) {
        this.terrain = [];
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
            this.terrain[terrain.x] = [];
        }

        if (!this.terrain[terrain.x][terrain.y]) {
            this.terrain[terrain.x][terrain.y] = [];
        }

        this.terrain[terrain.x][terrain.y][terrain.z] = terrain;
    }

    private generateRandomTerrain() {
        const n = 3;
        const results = [];
        for (let dx = -n; dx <= n; dx++) {
            for (let dy = Math.max(-n, -dx - n); dy <= Math.min(n, -dx + n); dy++) {
                const dz = -dx - dy;

                const terrain = new TerrainSegment(
                    uuid(),
                    this.terrainTypes.getType("plains"),
                    dx,
                    dy,
                    dz
                );

                this.addTerrain(terrain);
            }
        }
    }

    private serializeTerrain(): GS.TerrainSegment[][][] {
        const terrain: GS.TerrainSegment[][][] = [];

        for (const xkey in this.terrain) {
            terrain[xkey] = [];
            for (const ykey in this.terrain[xkey]) {
                terrain[xkey][ykey] = [];
                for (const zkey in this.terrain[xkey][ykey]) {
                    terrain[xkey][ykey][zkey] = this.terrain[xkey][ykey][zkey].serialize();
                }
            }
        }

        return terrain;
    }

    private deserializeTerrain(data: GS.TerrainSegment[][][]) {
        for (const xkey in data) {
            this.terrain[xkey] = [];
            for (const ykey in data[xkey]) {
                this.terrain[xkey][ykey] = [];
                for (const zkey in data[xkey][ykey]) {
                    this.terrain[xkey][ykey][zkey] = TerrainSegment.deserialize(this, data[xkey][ykey][zkey]);
                }
            }
        }
    }

}
