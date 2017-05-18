import * as GS from "./GameState";
import {ModelContainer} from "./ModelContainer";
import {Unit} from "./Models";

export class UnitContainer extends ModelContainer<GS.IUnit, Unit> {
    constructor() {
        super("unit", Unit.deserialize);
    }
}
