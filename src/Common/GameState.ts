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
    naturalResources: INaturalResources;
}

export interface IHex {
    q: number;
    r: number;
}

export interface ICity {
    id: ID;
    name: string;

    terrain: ID;
    faction: ID;

    currentHealth: number;
    currentEnergy: number;

    resources: INaturalResources;
    productionQueue: IProductionQueue;

    buildings: IBuilding[];
    owns: IHex[];
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

export interface IProductionQueue {
    /**
     * How many resources the city has already gathered for the production of the next thing.
     *
     * It's calculated from the excess resources of a city at the start of its factions turn.
     * When an item is ready to be popped, the contributedCosts are zeroed
     */
    contributedCost: INaturalResources;
    // Is the next things spawn blocked, eg. by another unit
    spawnBlocked: boolean;

    queue: UnitType[];
}

export interface INaturalResources {
    food?: number;
    production?: number;
}
