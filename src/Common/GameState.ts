/**
 * Interfaces and types for serialization of the game state
 */

export type ID = string;

export interface ITerrainData {
    [r: number]: {
        [q: number]: ITerrainSegment;
    };
}

export interface IUnits {
    [id: string]: IUnit;
}

export interface ICities {
    [id: string]: ICity;
}

export type GameStatus = "lobby" | "started" | "ended";

export interface IGame {
    id: ID;
    name: string;
    status: GameStatus;

    tick: number;
    terrain: ITerrainData;
    factions: IFaction[];
    units: IUnits;
    cities: ICities;
}

export type FactionType = string;

export interface IFaction {
    id: ID;

    factionType: FactionType;
    unlockedUpgrades: UpgradeName[];
    canAct: boolean;
    order: number;
}

export type UpgradeName = string;

export type TerrainType = string;

export interface ITerrainSegment {
    id: ID;

    q: number;
    r: number;

    terrainType: TerrainType;
    naturalResources: IResources;
}

export interface ICity {
    id: ID;
    name: string;

    terrain: ID;
    faction: ID;

    currentHealth: number;
    currentEnergy: number;

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

    terrain: ID;
    faction: ID;

    currentHealth: number;
    currentEnergy: number;
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
