import * as R from "ramda";

import {TypeManager, UnitType} from ".";
import {Faction} from "../Models/Faction";
import {calculateValue, unlocked} from "./Effect";

export class UnitTypes extends TypeManager<UnitType> {
    constructor() {
        super();
        this.typeName = "unit";
    }

    public unlockedFor(faction: Faction) {
        return R.values(this.types).filter((unitType) => unitType.isUnlocked(faction));
    }

    public transformRaw(data: any): UnitType {
        return new UnitType(
            data.name,
            data.health,
            data.damage,
            data.energy,
            data.actions,
            data.type,
            data.cost,
            data.modifiers,
        );
    }
}
