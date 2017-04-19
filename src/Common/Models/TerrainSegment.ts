import {Game} from "../Game";
import * as GS from "../GameState";
import {TerrainType} from "../Types";

import {Unit} from "./Unit";

export class TerrainSegment {
    public static deserialize(game: Game, data: GS.ITerrainSegment): TerrainSegment {
        return new TerrainSegment(
            data.id,
            game.types.terrain.getType(data.terrainType),
            data.x,
            data.y,
            data.z,
            data.units.map((x) => Unit.deserialize(game, x)),
        );
    }

    constructor(
        public id: GS.ID,
        public type: TerrainType,
        public x: number,
        public y: number,
        public z: number,
        public units: Unit[],
    ) {
        if (x + y + z !== 0) {
            throw new Error("TerrainSegment x + y + z should equal 0");
        }
    }

    public serialize(): GS.ITerrainSegment {
        return {
            city: null,
            id: this.id,
            naturalResources: {},
            terrainType: this.type.name,
            units: this.units.map((x) => x.serialize()),
            x: this.x,
            y: this.y,
            z: this.z,
        };
    }
}
