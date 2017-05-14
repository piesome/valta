import {v4 as uuid} from "uuid";

import {Game} from "./Game";
import {ITerrainGenerator} from "./ITerrainGenerator";
import {NaturalResources, TerrainSegment} from "./Models";
import {Hex} from "./Util";

export class HexagonTerrainGenerator implements ITerrainGenerator {
    constructor(
        private game: Game,
        private size: number,
    ) {}

    public generate(): Hex[] {
        const n = this.size;
        for (let dx = -n; dx <= n; dx++) {
            for (let dy = Math.max(-n, -dx - n); dy <= Math.min(n, -dx + n); dy++) {
                const dz = -dx - dy;

                const terrain = new TerrainSegment(
                    uuid(),
                    this.game.types.terrain.getType("plains"),
                    dx,
                    dz,
                    new NaturalResources(1, 1),
                );

                this.game.addTerrain(terrain);
            }
        }

        return (new Hex(0, 0)).neighbours().map((hex) => new Hex(this.size * hex.q, this.size * hex.r));
    }
}
