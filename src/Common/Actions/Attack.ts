import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Action} from "./Action";

export class Attack extends Action<Unit> {
    public name = "attack";

    public range(unit: Unit): number {
        // todo: ranged units
        return 1;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        return Math.max(1, unit.currentEnergy);
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        if (unit.terrain.distanceTo(terrain) > this.range(unit)) {
            throw new Error(`Unit can't attack that far`);
        }

        const defending = terrain.getDefendingUnits();
        if (defending.length === 0) {
            throw new Error(`Nothing to attack`);
        }

        this.game.battleUnits(unit, defending);

        // if all defenders fell, move unit to terrain
        if (unit.currentHealth > 0 && terrain.getDefendingUnits().length === 0) {
            this.game.moveUnitTo(unit, terrain);
        }
    }

    public deserializeActor(data: any) {
        return this.game.getUnit(data as string);
    }
}
