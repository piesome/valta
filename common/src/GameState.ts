/**
 * Interfaces and types for serialization of the game state
 */

export type ID = string;

export type TerrainData = {[x: number]: {[y: number]: {[z: number]: TerrainSegment}}};

export interface GameState {
    terrain: TerrainData;
    factions: Faction[];
}

export type FactionType = string;

export interface Faction {
    id: ID;

    factionType: FactionType;
    unlockedUpgrades: UpgradeName[];
    canAct: boolean;
}

export type UpgradeName = string;

export type TerrainType = string;

export interface TerrainSegment {
    id: ID;

    // x - y - z = 0
    x: number;
    y: number;
    z: number;

    terrainType: TerrainType;

    units: Unit[];
    city: City;

    naturalResources: Resources;
}

export interface City {
    id: ID;

    faction: ID;
    productionQueue: ProductionQueueItem[];
    buildings: Building[];
}

export type BuildingType = string;

export interface Building {
    id: ID;

    buildingType: BuildingType;
}

export type UnitType = string;

export interface Unit {
    id: ID;

    faction: ID;
    currentHealth: number;
    unitType: UnitType;
}

export interface ProductionQueueItem {
    id: ID;

    name: string;
    costInResources: Resources;
    resultingUnitType: UnitType;
    resultingBuildingType: BuildingType;
}

export interface Resources {
    gold?: number;
    food?: number;
    tools?: number;
    magic?: number;
}
