import {TypeManager, UnitType} from ".";
import {Faction} from "../Models/Faction";
import {calculateValue, unlocked} from "./Improvement";

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
            data.actions,
        );
    }
}
