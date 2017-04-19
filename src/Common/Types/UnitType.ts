import {Faction} from "../Models/Faction";
import {calculateValue, unlocked} from "./Improvement";
import {TypeManager} from "./TypeManager";

export class UnitType {
    constructor(
        public name: string,
        public baseHealth: number,
        public baseDamage: number,
        public actions: string[],
    ) {}

    getMaximumHealth(faction: Faction) {
        return calculateValue(
            faction,
            {
                unitType: this.name,
                field: "health",
            },
            this.baseHealth,
        );
    }

    getDamage(faction: Faction) {
        return calculateValue(
            faction,
            {
                unitType: this.name,
                field: "damage",
            },
            this.baseDamage,
        );
    }

    isUnlocked(faction: Faction) {
        return unlocked(faction, {unitType: this.name});
    }
}

export class UnitTypeManager extends TypeManager<UnitType> {
    constructor() {
        super();
        this.typeName = "unit";
    }

    transformRaw(data: any): UnitType {
        return new UnitType(
            data.name,
            data.heath,
            data.damage,
            data.actions,
        );
    }
}
