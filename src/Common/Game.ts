import * as debug from "debug";
import { EventEmitter } from "eventemitter3";
import * as R from "ramda";
import { v4 as uuid } from "uuid";

import * as validator from "class-validator";
import { ActionManager } from "./Actions";
import { CityContainer } from "./CityContainer";
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
import { TerrainContainer } from "./TerrainContainer";
import { Types } from "./Types";
import { UnitContainer } from "./UnitContainer";
import { Hex } from "./Util";

export class Game extends EventEmitter {
    public types: Types;
    public actionManager: ActionManager;

    public id: GS.ID;
    public name: string;
    public status: GS.GameStatus;

    public factions: Faction[];
    public tick: number;
    public settings: GS.MapSettings;

    public cities: CityContainer;
    public units: UnitContainer;
    public terrain: TerrainContainer;

    private log: debug.IDebugger;

    constructor(types?: Types) {
        super();

        this.id = uuid();
        this.name = "";
        this.status = "lobby";

        this.tick = 0;
        this.factions = [];

        this.terrain = new TerrainContainer();
        this.units = new UnitContainer();
        this.cities = new CityContainer();

        this.settings = new GS.MapSettings();

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
            const terr = this.terrain.getByCoords(startingPoint.r, startingPoint.q);

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

        for (const unit of this.units.ofFaction(newFaction)) {
            unit.emit("tick");
        }
        for (const city of this.cities.ofFaction(newFaction)) {
            city.emit("tick");
        }

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
        validator.validate(settings).then((errors) => {
            if (errors.length > 0) {
                throw new Error(`Settings-object validation failed: ` + errors.toString());
            } else {
                this.settings = settings;
            }
        });
    }

    public createUnit(unitType: string, faction: Faction) {
        const type = this.types.unit.getType(unitType);
        if (!type.isUnlocked(faction)) {
            throw new Error(`Unit type ${unitType} not unlocked`);
        }

        const unit = new Unit(uuid(), type, faction, null);
        this.units.add(unit);
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
        this.cities.add(city);
        return city;
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
        this.terrain.deserialize(this, data.terrain);
        this.units.deserialize(this, data.units);
        this.cities.deserialize(this, data.cities);

        this.emit("deserialized");
    }

    public serialize(): GS.IGame {
        return {
            cities: this.cities.serialize(),
            factions: this.factions.map((x) => x.serialize()),
            id: this.id,
            name: this.name,
            settings: this.settings,
            status: this.status,
            terrain: this.terrain.serialize(),
            tick: this.tick,
            units: this.units.serialize(),
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
}
