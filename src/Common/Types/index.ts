export {IEffect, IEffectTarget} from "./Effect";

export {CombatModifierType} from "./CombatModifierType";
export {FactionType} from "./FactionType";
export {TerrainType} from "./TerrainType";
export {UnitType} from "./UnitType";
export {UpgradeType} from "./UpgradeType";
export {BuildingType} from "./BuildingType";

export {TypeManager} from "./TypeManager";

import {CombatModifierTypes} from "./CombatModifierTypes";
import {FactionTypes} from "./FactionTypes";
import {TerrainTypes} from "./TerrainTypes";
import {UnitTypes} from "./UnitTypes";
import {UpgradeTypes} from "./UpgradeTypes";
export {BuildingTypes} from "./BuildingTypes";

export {
    FactionTypes,
    TerrainTypes,
    UnitTypes,
    UpgradeTypes,
};

export class Types {
    public faction: FactionTypes;
    public terrain: TerrainTypes;
    public unit: UnitTypes;
    public upgrade: UpgradeTypes;

    constructor() {
        this.faction = new FactionTypes();
        this.terrain =  new TerrainTypes();
        this.unit = new UnitTypes();
        this.upgrade = new UpgradeTypes();
    }

    public async load() {
        try {
            await this.faction.load();
            await this.terrain.load();
            await this.unit.load();
            await this.upgrade.load();
        } catch (err) {
            throw err;
        }
    }
}
