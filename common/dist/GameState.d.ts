/**
 * Interfaces and types for serialization of the game state
 */
export declare type ID = string;
export interface GameState {
    terrain: TerrainSegment[][][];
    factions: Faction[];
}
export declare type FactionType = string;
export interface Faction {
    id: ID;
    factionType: FactionType;
    unlockedTechnologies: Technology[];
    canAct: boolean;
}
export declare type Technology = string;
export declare type TerrainType = string;
export interface TerrainSegment {
    id: ID;
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
export declare type BuildingType = string;
export interface Building {
    id: ID;
    buildingType: BuildingType;
}
export declare type UnitType = string;
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
