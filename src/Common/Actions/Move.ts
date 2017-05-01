import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Action} from "./Action";

export class Move extends Action<Unit> {
    public range(unit: Unit): number {
        return unit.currentEnergy;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        return unit.terrain.distanceTo(terrain);
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        this.game.moveUnitTo(unit, terrain);
    }

    public deserializeActor(data: any) {
        return this.game.getUnit(data as string);
    }
}
