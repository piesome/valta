import {Game} from "../Game";
import * as GS from "../GameState";
import {TerrainType} from "../Types";
import {Hex} from "../Util";
import {City} from "./City";
import {Faction} from "./Faction";
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
    public city: City;

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

    /**
     * @todo Don't target civilians, something fancy with cities
     */
    public getDefendingUnits(): Unit[] {
        return this.units;
    }

    public occupyingFaction(): Faction {
        if (this.city) {
            return this.city.faction;
        }
        if (this.units.length > 0) {
            return this.units[0].faction;
        }
        return null;
    }

    public movementCostForFaction(faction: Faction): number {
        const thisFaction = this.occupyingFaction();
        if (thisFaction) {
            return this.type.movementCost + ((thisFaction.id === faction.id) ? 0 : Number.MAX_SAFE_INTEGER / 2);
        }

        return this.type.movementCost;
    }

    public serialize(): GS.ITerrainSegment {
        return {
            id: this.id,
            naturalResources: {},
            q: this.q,
            r: this.r,
            terrainType: this.type.name,
        };
    }
}
