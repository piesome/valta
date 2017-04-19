/**
 * Interfaces and types for serialization of the game state
 */

export type ID = string;

export interface ITerrainData {
    [x: number]: {
        [y: number]: {
            [z: number]: ITerrainSegment;
        };
    };
}

export interface IGameState {
    terrain: ITerrainData;
    factions: IFaction[];
}

export type FactionType = string;

export interface IFaction {
    id: ID;

    factionType: FactionType;
    unlockedUpgrades: UpgradeName[];
    canAct: boolean;
}

export type UpgradeName = string;

export type TerrainType = string;

export interface ITerrainSegment {
    id: ID;

    // x - y - z = 0
    x: number;
    y: number;
    z: number;

    terrainType: TerrainType;

    units: IUnit[];
    city: ICity;

    naturalResources: IResources;
}

export interface ICity {
    id: ID;

    faction: ID;
    productionQueue: IProductionQueueItem[];
    buildings: IBuilding[];
}

export type BuildingType = string;

export interface IBuilding {
    id: ID;

    buildingType: BuildingType;
}

export type UnitType = string;

export interface IUnit {
    id: ID;

    faction: ID;
    currentHealth: number;
    unitType: UnitType;
}

export interface IProductionQueueItem {
    id: ID;

    name: string;
    costInResources: IResources;
    resultingUnitType: UnitType;
    resultingBuildingType: BuildingType;
}

export interface IResources {
    gold?: number;
    food?: number;
    tools?: number;
    magic?: number;
}
