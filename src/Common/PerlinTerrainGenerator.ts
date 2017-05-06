import OpenSimplexNoise from "@minttu/open-simplex-noise";
import * as debug from "debug";
import {v4 as uuid} from "uuid";

import {Game} from "./Game";
import {ITerrainGenerator} from "./ITerrainGenerator";
import {TerrainSegment} from "./Models";
import {Hex} from "./Util";

export class PerlinTerrainGenerator implements ITerrainGenerator {
    constructor(
        private game: Game,
        private size: number,
    ) {}

    public generate(): Hex[] {
        const simplex = new OpenSimplexNoise(Date.now());
        const n = this.size;
        const terrains = [this.game.types.terrain.getType("sea"), this.game.types.terrain.getType("plains"),
        this.game.types.terrain.getType("forest"), this.game.types.terrain.getType("mountains")];

        const log = debug("valta:GameServer");

        for (let dx = -n; dx <= n; dx++) {
            for (let dy = -n; dy <= n; dy++) {
                const dz = -dx - dy;

                const terrain = new TerrainSegment(
                    uuid(),
                    terrains[Math.round(this.clamp(this.clamp(simplex.noise2D(dx, dy)*2, 0, 1) * 10,
                    0, terrains.length - 1))],
                    dx,
                    dz,
                );

                this.game.addTerrain(terrain);
            }
        }

        return (new Hex(0, 0)).neighbours().map((hex) => new Hex(this.size * hex.q, this.size * hex.r));
    }

    private clamp(val: number, min: number, max: number): number {
        return Math.min(Math.max(min, val), max);
    }
}
