import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Hex} from "../Util";
import {astar, IPath} from "../Util/Astar";
import {Action} from "./Action";

export class Move extends Action<Unit> {
    public range(unit: Unit): number {
        return unit.currentEnergy;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        return this.getAMoves(unit, terrain).cost;
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        this.game.moveUnitTo(unit, terrain);
    }

    public deserializeActor(data: any) {
        return this.game.getUnit(data as string);
    }

    private getAMoves(unit: Unit, target: TerrainSegment): IPath<TerrainSegment> {
        const neighbours = (t: TerrainSegment) => {
            return t.neighbours().map((hex) => this.game.getTerrainSegmentByHex(hex)).filter((x) => x !== null);
        };

        const cost = (_: TerrainSegment, t: TerrainSegment) => {
            return t.movementCostForFaction(unit.faction);
        };

        const path = astar(unit.terrain, target, neighbours, cost);
        return path;
    }
}
