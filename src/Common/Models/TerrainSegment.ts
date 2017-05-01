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
        );
    }

    public units: Unit[];

    constructor(
        public id: GS.ID,
        public type: TerrainType,
        q: number,
        r: number,
    ) {
        super(q, r);

        this.units = [];
    }

    public canUnitBeAdded(unit: Unit) {
        if (this.units.length === 0) {
            return true;
        }
        // TODO: fix inf stack of same faction
        return this.units[0].faction.id === unit.faction.id;
    }

    public addUnit(unit: Unit) {
        this.units.push(unit);
    }

    public removeUnit(unit: Unit) {
        this.units = this.units.filter((un) => un.id !== unit.id);
    }

    public serialize(): GS.ITerrainSegment {
        return {
            city: null,
            id: this.id,
            naturalResources: {},
            q: this.q,
            r: this.r,
            terrainType: this.type.name,
        };
    }
}
