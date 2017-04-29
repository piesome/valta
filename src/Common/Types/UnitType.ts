import {CombatModifierType} from ".";
import {Faction} from "../Models/Faction";
import {calculateValue, unlocked} from "./Effect";

export class UnitType {
    constructor(
        public name: string,
        public baseHealth: number,
        public baseDamage: number,
        public baseEnergy: number,
        public actions: string[],
        public type: string,
        public modifiers?: CombatModifierType[],
    ) {}

    public getMaximumHealth(faction: Faction) {
        return calculateValue(
            faction,
            {
                field: "health",
                unitType: this.name,
            },
            this.baseHealth,
        );
    }

    public getDamage(faction: Faction) {
        return calculateValue(
            faction,
            {
                field: "damage",
                unitType: this.name,
            },
            this.baseDamage,
        );
    }

    public getMaximumEnergy(faction: Faction) {
        return calculateValue(
            faction,
            {
                field: "energy",
                unitType: this.name,
            },
            this.baseEnergy,
        );
    }

    public isUnlocked(faction: Faction) {
        return unlocked(faction, {unitType: this.name});
    }
}
