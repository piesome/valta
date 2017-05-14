import * as debug from "debug";
import { EventEmitter } from "eventemitter3";
import * as R from "ramda";
import { v4 as uuid } from "uuid";

import { ActionManager } from "./Actions";
import * as GS from "./GameState";
import { HexagonTerrainGenerator } from "./HexagonTerrainGenerator";
import {
    City,
    Faction,
    NaturalResources,
    TerrainSegment,
    Unit,
} from "./Models";
import { PerlinTerrainGenerator } from "./PerlinTerrainGenerator";
import { Types } from "./Types";
import { Hex } from "./Util";

export class Game extends EventEmitter {
    public types: Types;
    public actionManager: ActionManager;

    public id: GS.ID;
    public name: string;
    public status: GS.GameStatus;

    public factions: Faction[];
    public tick: number;
    public terrain: { [r: number]: { [q: number]: TerrainSegment } };
    public units: { [id: string]: Unit };
    public cities: { [id: string]: City };
    public settings: GS.MapSettings;

    private terrainById: { [id: string]: TerrainSegment };
    private log: debug.IDebugger;

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
        this.cities = {};
        this.settings = new GS.MapSettings();
        this.terrainById = {};

        this.types = types || new Types();
        this.actionManager = new ActionManager(this);
        this.log = debug("valta:Game");
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

        this.log(this.settings.selectedMapType);

        // var startingPoints = new Array<Hex>();
        // if (this.settings.selectedMapType === "hex") {
        //     startingPoints = (new HexagonTerrainGenerator(this, 10)).generate();
        // }
        // else if (this.settings.selectedMapType === "perlin") {
        //     startingPoints = (new PerlinTerrainGenerator(this, 10)).generate();
        // }

        const startingPoints = (new HexagonTerrainGenerator(this, 10)).generate();

        for (const fact of this.factions) {
            const startingPoint = startingPoints[fact.order]; // TODO: fix order
            const terr = this.terrain[startingPoint.r][startingPoint.q];

            const wagon = this.createUnit("wagon", fact);
            wagon.moveTo(terr);

            const scout = this.createUnit("scout", fact);
            scout.moveTo(terr);
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
        this.tick += 1;

        this.factionsUnits(newFaction).map((unit) => unit.emit("tick"));
        this.factionsCities(newFaction).map((city) => city.emit("tick"));

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

    public changeSettings(id: GS.ID, settings: GS.MapSettings) {
        this.assertLobby();
        this.settings = settings;
    }

    public createUnit(unitType: string, faction: Faction) {
        const type = this.types.unit.getType(unitType);
        if (!type.isUnlocked(faction)) {
            throw new Error(`Unit type ${unitType} not unlocked`);
        }

        const unit = new Unit(uuid(), type, faction, null);
        this.addUnit(unit);
        return unit;
    }

    public battleUnits(attacker: Unit, defenders: Unit[]) {
        for (const def of defenders) {
            // TODO: more advanced calculations?
            def.takeDamage(attacker.damage);
            attacker.takeDamage(def.damage);
        }
    }

    public moveUnitTo(unit: Unit, terrain: TerrainSegment) {
        unit.moveTo(terrain);
    }

    public createCity(faction: Faction, terrain: TerrainSegment) {
        const id = uuid();
        const city = new City(this, id, id, faction, terrain, 100, 0, R.append(terrain, terrain.neighbours()));
        if (!city.canBeAdded()) {
            throw new Error(`City can't be created there`);
        }
        this.addCity(city);
        return city;
    }

    public factionsUnits(faction: Faction) {
        return R.filter((unit) => unit.faction.id === faction.id, R.values(this.units));
    }

    public factionsCities(faction: Faction) {
        return R.filter((city) => city.faction.id === faction.id, R.values(this.cities));
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

    public getCity(id: GS.ID) {
        const ret = this.cities[id];
        if (!ret) {
            throw new Error(`No such city with id ${id}`);
        }
        return ret;
    }

    public addTerrain(terrain: TerrainSegment) {
        this.terrainById[terrain.id] = terrain;

        if (!this.terrain[terrain.r]) {
            this.terrain[terrain.r] = {};
        }

        this.terrain[terrain.r][terrain.q] = terrain;
    }

    public getTerrainSegmentByHex(hex: Hex): TerrainSegment {
        return this.getTerrainSegmentByCoords(hex.r, hex.q);
    }

    public getTerrainSegmentByCoords(r: number, q: number): TerrainSegment | null {
        if (this.terrain[r] && this.terrain[r][q]) {
            return this.terrain[r][q];
        }
        return null;
    }

    public addUnit(unit: Unit) {
        this.units[unit.id] = unit;

        unit.on("dead", () => {
            this.removeUnit(unit);
        });
    }

    public removeUnit(unit: Unit) {
        unit.removeAllListeners();
        delete this.units[unit.id];
    }

    public addCity(city: City) {
        this.cities[city.id] = city;

        city.emit("added");
        city.on("dead", () => {
            this.removeCity(city);
        });
    }

    public removeCity(city: City) {
        city.removeAllListeners();
        delete this.cities[city.id];

        city.emit("removed");
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
        this.settings = data.settings;
        this.deserializeTerrain(data.terrain);
        this.deserializeUnits(data.units);
        this.deserializeCities(data.cities);

        this.emit("deserialized");
    }

    public serialize(): GS.IGame {
        return {
            cities: this.serializeCities(),
            factions: this.factions.map((x) => x.serialize()),
            id: this.id,
            name: this.name,
            settings: this.settings,
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

    public *terrains() {
        for (const row in this.terrain) {
            if (!this.terrain.hasOwnProperty(row)) {
                continue;
            }

            for (const column in this.terrain[row]) {
                if (!this.terrain[row].hasOwnProperty(column)) {
                    continue;
                }

                yield this.terrain[row][column];
            }
        }
    }

    private serializeCities(): GS.ICities {
        const data: GS.ICities = {};

        for (const id in this.cities) {
            if (!this.cities.hasOwnProperty(id)) {
                continue;
            }

            data[id] = this.cities[id].serialize();
        }

        return data;
    }

    private deserializeCities(data: GS.ICities) {
        this.cities = {};

        for (const id in data) {
            if (!data.hasOwnProperty(id)) {
                continue;
            }

            const city = City.deserialize(this, data[id]);
            this.addCity(city);
        }
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
            this.addUnit(unit);
        }
    }

    private serializeTerrain(): GS.ITerrainData {
        const terrain: GS.ITerrainData = {};

        for (const ter of this.terrains()) {
            if (!terrain[ter.r]) {
                terrain[ter.r] = {};
            }
            terrain[ter.r][ter.q] = ter.serialize();
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
