import {Game} from "./Game";
import * as GS from "./GameState";
import { TerrainSegment } from "./Models";
import {Hex} from "./Util";

export class TerrainContainer {
    private terrain: { [r: number]: { [q: number]: TerrainSegment } };
    private byId: { [id: string]: TerrainSegment };

    constructor() {
        this.terrain = {};
        this.byId = {};
    }

    public get(id: GS.ID) {
        const ret = this.byId[id];
        if (!ret) {
            throw new Error(`No terrain with id ${id}`);
        }
        return ret;
    }

    public add(terrain: TerrainSegment) {
        this.byId[terrain.id] = terrain;

        if (!this.terrain[terrain.r]) {
            this.terrain[terrain.r] = {};
        }

        this.terrain[terrain.r][terrain.q] = terrain;
    }

    public getByHex(hex: Hex): TerrainSegment {
        return this.getByCoords(hex.r, hex.q);
    }

    public getByCoords(r: number, q: number): TerrainSegment | null {
        if (this.terrain[r] && this.terrain[r][q]) {
            return this.terrain[r][q];
        }
        return null;
    }

    public * all() {
        for (const row in this.terrain) {
            if (!this.terrain.hasOwnProperty(row)) {
                continue;
            }

            for (const column in this.terrain[row]) {
                if (!this.terrain[row].hasOwnProperty(column)) {
                    continue;
                }

                yield this.terrain[row][column];
            }
        }
    }

    public serialize(): GS.ITerrainData {
        const terrain: GS.ITerrainData = {};

        for (const ter of this.all()) {
            if (!terrain[ter.r]) {
                terrain[ter.r] = {};
            }
            terrain[ter.r][ter.q] = ter.serialize();
        }

        return terrain;
    }

    public deserialize(game: Game, data: GS.ITerrainData) {
        this.terrain = {};
        this.byId = {};

        for (const row in data) {
            if (!data.hasOwnProperty(row)) {
                continue;
            }

            for (const column in data[row]) {
                if (!data[row].hasOwnProperty(column)) {
                    continue;
                }

                const terrain = TerrainSegment.deserialize(game, data[row][column]);
                this.add(terrain);
            }
        }
    }
}
