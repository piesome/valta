import {EventEmitter} from "eventemitter3";
import * as R from "ramda";
import {v4 as uuid} from "uuid";

import {ActionManager} from "./Actions";
import * as GS from "./GameState";
import {
    Faction,
    TerrainSegment,
    Unit,
} from "./Models";
import {TerrainGenerator} from "./TerrainGenerator";
import {Types} from "./Types";
import {Hex} from "./Util";

export class Game extends EventEmitter {
    public types: Types;
    public actionManager: ActionManager;

    public id: GS.ID;
    public name: string;
    public status: GS.GameStatus;

    public factions: Faction[];
    public tick: number;
    public terrain: {[r: number]: {[q: number]: TerrainSegment}};
    public units: {[id: string]: Unit};

    private terrainById: {[id: string]: TerrainSegment};

    constructor(
        types?: Types,
    ) {
        super();

        this.id = uuid();
        this.name = "";
        this.status = "lobby";

        this.tick = 0;
        this.terrain = {};
        this.factions = [];
        this.units = {};
        this.terrainById = {};

        this.types = types || new Types();
        this.actionManager = new ActionManager(this);
    }

    public assertLobby() {
        if (this.status !== "lobby") {
            throw new Error(`Game ${this.id} should be a lobby`);
        }
    }

    public assertStarted() {
        if (this.status !== "started") {
            throw new Error(`Game ${this.id} should have been started`);
        }
    }

    public canBeStarted() {
        return this.status === "lobby" &&
            this.factions.length >= 2 &&
            R.all((faction: Faction) => faction.type.isReal, this.factions);
    }

    public checkCanBeStarted() {
        this.emit("update");

        if (this.canBeStarted()) {
            this.emit("canBeStarted");
        }
    }

    public startGame() {
        if (!this.canBeStarted()) {
            throw new Error("Game can't be started");
        }

        const startingPoints = (new TerrainGenerator(this, 10)).generate();
        for (const fact of this.factions) {
            const startingPoint = startingPoints[fact.order]; // TODO: fix order
            const terr = this.terrain[startingPoint.r][startingPoint.q];
            const unit = this.createUnit("testunit", fact);
            unit.moveTo(terr);
        }
        this.status = "started";
        this.endTurn();
    }

    public endTurn() {
        this.assertStarted();

        const orderedFactions = R.sortBy((faction) => faction.order, this.factions);
        const currentTurn = R.find((faction) => faction.canAct, orderedFactions);

        R.map((faction) => faction.canAct = false, this.factions);

        let newFaction: Faction;

        if (!currentTurn || currentTurn.order === orderedFactions.length - 1) {
            newFaction = this.getFaction(orderedFactions[0].id);
        } else {
            newFaction = this.getFaction(orderedFactions[currentTurn.order + 1].id);
        }

        newFaction.canAct = true;
        this.factionsUnits(newFaction).map((unit) => unit.resetEnergy());

        this.tick += 1;
        this.emit("update");
    }

    public createFaction(peerId: GS.ID): Faction {
        this.assertLobby();

        const faction = new Faction(
            peerId,
            this.types.faction.getType("undecided"),
            false,
            this.types.upgrade.automaticallyUnlocked(),
            this.factions.length,
        );

        this.factions.push(faction);

        this.checkCanBeStarted();

        return faction;
    }

    public selectFactionType(id: GS.ID, factionType: string) {
        this.assertLobby();

        const faction = this.getFaction(id);

        const type = this.types.faction.getType(factionType);
        faction.type = type;

        this.checkCanBeStarted();
    }

    public getFaction(id: GS.ID) {
        const faction = this.factions.filter((x) => x.id === id)[0];
        if (!faction) {
            throw new Error("No such faction");
        }

        return faction;
    }

    public removeFaction(id: GS.ID) {
        this.assertLobby();

        const faction = this.getFaction(id);

        this.factions = R.filter((x: Faction) => x.id !== faction.id, this.factions);
        this.factions.map((fact, ind) => fact.order = ind);

        this.checkCanBeStarted();
    }

    public createUnit(unitType: string, faction: Faction) {
        const type = this.types.unit.getType("testunit");
        if (!type.isUnlocked(faction)) {
            throw new Error(`Unit type ${unitType} not unlocked`);
        }

        const unit = new Unit(uuid(), type, faction, null);
        this.units[unit.id] = unit;
        return unit;
    }

    public moveUnitTo(unit: Unit, terrain: TerrainSegment) {
        unit.moveTo(terrain);
    }

    public factionsUnits(faction: Faction) {
        return R.filter((unit) => unit.faction.id === faction.id, R.values(this.units));
    }

    public getUnit(id: GS.ID) {
        const ret = this.units[id];
        if (!ret) {
            throw new Error(`No unit with id ${id}`);
        }
        return ret;
    }

    public getTerrain(id: GS.ID) {
        const ret = this.terrainById[id];
        if (!ret) {
            throw new Error(`No terrain with id ${id}`);
        }
        return ret;
    }

    public allTerrain(): TerrainSegment[] {
        const terrains: TerrainSegment[] = [];

        for (const row in this.terrain) {
            if (!this.terrain.hasOwnProperty(row)) {
                continue;
            }
            for (const column in this.terrain[row]) {
                if (!this.terrain[row].hasOwnProperty(column)) {
                    continue;
                }

                terrains.push(this.terrain[row][column]);
            }
        }

        return terrains;
    }

    public findUnitsTerrain(unit: Unit): TerrainSegment {
        // TODO: fix this fast

        for (const row in this.terrain) {
            if (!this.terrain.hasOwnProperty(row)) {
                continue;
            }
            for (const column in this.terrain[row]) {
                if (!this.terrain[row].hasOwnProperty(column)) {
                    continue;
                }

                for (const iter of this.terrain[row][column].units) {
                    if (iter.id === unit.id) {
                        return this.terrain[row][column];
                    }
                }
            }
        }

        throw new Error(`Couldn't find unit ${unit.id}`);
    }

    public addTerrain(terrain: TerrainSegment) {
        this.terrainById[terrain.id] = terrain;

        if (!this.terrain[terrain.r]) {
            this.terrain[terrain.r] = {};
        }

        this.terrain[terrain.r][terrain.q] = terrain;
    }

    public async load() {
        try {
            await this.types.load();
        } catch (err) {
            throw err;
        }
    }

    public deserialize(data: GS.IGame) {
        this.id = data.id;
        this.name = data.name;
        this.status = data.status;
        this.tick = data.tick;
        this.factions = data.factions.map((x) => Faction.deserialize(this, x));
        this.deserializeTerrain(data.terrain);
        this.deserializeUnits(data.units);

        this.emit("deserialized");
    }

    public serialize(): GS.IGame {
        return {
            factions: this.factions.map((x) => x.serialize()),
            id: this.id,
            name: this.name,
            status: this.status,
            terrain: this.serializeTerrain(),
            tick: this.tick,
            units: this.serializeUnits(),
        };
    }

    public serializeShort() {
        return {
            factionCount: this.factions.length,
            id: this.id,
            name: this.name,
            status: this.status,
        };
    }

    private serializeUnits(): GS.IUnits {
        const data: GS.IUnits = {};
        for (const id in this.units) {
            if (!this.units.hasOwnProperty(id)) {
                continue;
            }

            data[id] = this.units[id].serialize();
        }

        return data;
    }

    private deserializeUnits(data: GS.IUnits) {
        this.units = {};

        for (const id in data) {
            if (!data.hasOwnProperty(id)) {
                continue;
            }

            const unit = Unit.deserialize(this, data[id]);
            this.units[unit.id] = unit;
        }
    }

    private serializeTerrain(): GS.ITerrainData {
        const terrain: GS.ITerrainData = {};

        for (const row in this.terrain) {
            if (!this.terrain.hasOwnProperty(row)) {
                continue;
            }

            terrain[row] = {};
            for (const column in this.terrain[row]) {
                if (!this.terrain[row].hasOwnProperty(column)) {
                    continue;
                }

                terrain[row][column] = this.terrain[row][column].serialize();
            }
        }

        return terrain;
    }

    private deserializeTerrain(data: GS.ITerrainData) {
        this.terrain = {};
        this.terrainById = {};

        for (const row in data) {
            if (!data.hasOwnProperty(row)) {
                continue;
            }

            for (const column in data[row]) {
                if (!data[row].hasOwnProperty(column)) {
                    continue;
                }

                const terrain = TerrainSegment.deserialize(this, data[row][column]);
                this.addTerrain(terrain);
            }
        }
    }
}
