import * as GS from "./GameState";
import {TerrainType} from "./TerrainType";
import {Game} from "./Game";

export class TerrainSegment {

    constructor(
        public id: GS.ID,
        public type: TerrainType,
        public x: number,
        public y: number,
        public z: number
    ) {
        if (x + y + z !== 0) {
            throw new Error("TerrainSegment x + y + z should equal 0");
        }
    }

    public static deserialize(game: Game, data: GS.TerrainSegment): TerrainSegment {
        return new TerrainSegment(
            data.id,
            game.terrainTypes.getType(data.terrainType),
            data.x,
            data.y,
            data.z
        );
    }

    public serialize(): GS.TerrainSegment {
        return {
            id: this.id,
            terrainType: this.type.name,
            x: this.x,
            y: this.y,
            z: this.z,
            units: [],
            naturalResources: {},
            city: null
        };
    }
}
