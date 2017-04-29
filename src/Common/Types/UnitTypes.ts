import {TypeManager, UnitType} from ".";
import {Faction} from "../Models/Faction";
import {calculateValue, unlocked} from "./Effect";

export class UnitTypes extends TypeManager<UnitType> {
    constructor() {
        super();
        this.typeName = "unit";
    }

    public transformRaw(data: any): UnitType {
        return new UnitType(
            data.name,
            data.heath,
            data.damage,
            data.energy,
            data.actions,
            data.type,
            data.modifiers,
        );
    }
}
