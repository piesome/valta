import * as GS from "../GameState";
import {TerrainType} from "../Types";
import {Game} from "../Game";

import {Unit} from "./Unit";

export class TerrainSegment {

    constructor(
        public id: GS.ID,
        public type: TerrainType,
        public x: number,
        public y: number,
        public z: number,
        public units: Unit[]
    ) {
        if (x + y + z !== 0) {
            throw new Error("TerrainSegment x + y + z should equal 0");
        }
    }

    public static deserialize(game: Game, data: GS.TerrainSegment): TerrainSegment {
        return new TerrainSegment(
            data.id,
            game.types.terrain.getType(data.terrainType),
            data.x,
            data.y,
            data.z,
            data.units.map((x) => Unit.deserialize(game, x))
        );
    }

    public serialize(): GS.TerrainSegment {
        return {
            id: this.id,
            terrainType: this.type.name,
            x: this.x,
            y: this.y,
            z: this.z,
            units: this.units.map((x) => x.serialize()),
            naturalResources: {},
            city: null
        };
    }
}
