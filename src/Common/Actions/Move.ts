import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Action} from "./Action";

export class Move extends Action<Unit, TerrainSegment> {
    public range(unit: Unit): number {
        return unit.currentEnergy;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        // todo fix units
        const currentTerrain = this.game.findUnitsTerrain(unit);
        return currentTerrain.distanceTo(terrain);
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        this.game.moveUnit(unit, terrain);
    }

    // TODO: fix with generics or smth

    public serializeActor(unit: Unit) {
        return unit.id;
    }

    public deserializeActor(data: any) {
        return this.game.getUnit(data as string);
    }

    public serializeTarget(terrain: TerrainSegment) {
        return terrain.id;
    }

    public deserializeTarget(data: any) {
        return this.game.getTerrain(data as string);
    }
}
