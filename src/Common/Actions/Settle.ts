import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Action} from "./Action";

export class Settle extends Action<Unit> {
    public name = "settle";

    public range(unit: Unit): number {
        return 0;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        return unit.maximumEnergy;
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        this.game.createCity(unit.faction, unit.terrain);
        unit.kill();
    }

    public deserializeActor(data: any) {
        return this.game.units.get(data as string);
    }
}
