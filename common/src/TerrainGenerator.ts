import {v4 as uuid} from "uuid";

import {TerrainSegment} from "./Models";
import {Game} from "./Game";

export class TerrainGenerator {
    constructor(
        private game: Game,
        private size: number
    ) {}

    generate() {
        const n = this.size;
        for (let dx = -n; dx <= n; dx++) {
            for (let dy = Math.max(-n, -dx - n); dy <= Math.min(n, -dx + n); dy++) {
                const dz = -dx - dy;

                const terrain = new TerrainSegment(
                    uuid(),
                    this.game.terrainTypes.getType("plains"),
                    dx,
                    dy,
                    dz,
                    []
                );

                this.game.addTerrain(terrain);
            }
        }
    }
}
