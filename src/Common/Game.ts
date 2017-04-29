import {EventEmitter} from "eventemitter3";
import * as R from "ramda";
import {v4 as uuid} from "uuid";

import * as GS from "./GameState";
import {
    Faction,
    TerrainSegment,
} from "./Models";
import {TerrainGenerator} from "./TerrainGenerator";
import {Types} from "./Types";

export class Game extends EventEmitter {
    public types: Types;

    public id: GS.ID;
    public name: string;
    public status: GS.GameStatus;

    public factions: Faction[];
    public tick: number;
    public terrain: {[r: number]: {[q: number]: TerrainSegment}};

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

        this.types = types || new Types();
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

        (new TerrainGenerator(this, 10)).generate();
        this.status = "started";
        this.endTurn();
    }

    public endTurn() {
        this.assertStarted();

        const orderedFactions = R.sortBy((faction) => faction.order, this.factions);
        const currentTurn = R.find((faction) => faction.canAct, orderedFactions);

        R.map((faction) => faction.canAct = false, this.factions);

        if (!currentTurn || currentTurn.order === orderedFactions.length - 1) {
            this.getFaction(orderedFactions[0].id).canAct = true;
        } else {
            this.getFaction(orderedFactions[currentTurn.order + 1].id).canAct = true;
        }

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

        this.checkCanBeStarted();
    }

    public addTerrain(terrain: TerrainSegment) {
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
    }

    public serialize(): GS.IGame {
        return {
            factions: this.factions.map((x) => x.serialize()),
            id: this.id,
            name: this.name,
            status: this.status,
            terrain: this.serializeTerrain(),
            tick: this.tick,
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
