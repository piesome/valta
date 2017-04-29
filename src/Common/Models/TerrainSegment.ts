import {Game} from "../Game";
import * as GS from "../GameState";
import {TerrainType} from "../Types";
import {Hex} from "../Util";

import {Unit} from "./Unit";

export class TerrainSegment extends Hex {
    public static deserialize(game: Game, data: GS.ITerrainSegment): TerrainSegment {
        return new TerrainSegment(
            data.id,
            game.types.terrain.getType(data.terrainType),
            data.q,
            data.r,
            data.units.map((x) => Unit.deserialize(game, x)),
        );
    }

    constructor(
        public id: GS.ID,
        public type: TerrainType,
        q: number,
        r: number,
        public units: Unit[],
    ) {
        super(q, r);
    }

    public serialize(): GS.ITerrainSegment {
        return {
            city: null,
            id: this.id,
            naturalResources: {},
            q: this.q,
            r: this.r,
            terrainType: this.type.name,
            units: this.units.map((x) => x.serialize()),
        };
    }
}
