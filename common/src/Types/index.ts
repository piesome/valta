import {FactionType, FactionTypeManager} from "./FactionType";
import {TerrainType, TerrainTypeManager} from "./TerrainType";
import {UnitType, UnitTypeManager} from "./UnitType";
import {UpgradeType, UpgradeTypeManager} from "./UpgradeType";

export {
    FactionType,
    FactionTypeManager,
    TerrainType,
    TerrainTypeManager,
    UnitType,
    UnitTypeManager,
    UpgradeType,
    UpgradeTypeManager
};

export class Types {
    public faction: FactionTypeManager;
    public terrain: TerrainTypeManager;
    public unit: UnitTypeManager;
    public upgrade: UpgradeTypeManager;

    constructor() {
        this.faction = new FactionTypeManager();
        this.terrain =  new TerrainTypeManager();
        this.unit = new UnitTypeManager();
        this.upgrade = new UpgradeTypeManager();
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
