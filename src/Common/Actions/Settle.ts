import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Action} from "./Action";

export class Settle extends Action<Unit> {
    public name = "settle";

    public range(unit: Unit): number {
        return 0;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        return Math.max(1, unit.currentEnergy);
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        if (unit.terrain.city) {
            throw new Error(`There's a city there already`);
        }

        this.game.createCity(unit.faction, unit.terrain);
        unit.kill();
    }

    public deserializeActor(data: any) {
        return this.game.getUnit(data as string);
    }
}
