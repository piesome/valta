import {EventEmitter} from "eventemitter3";

import {Game} from "./Game";
import * as GS from "./GameState";
import {Faction} from "./Models";

export interface IModel<T> extends EventEmitter {
    id: string;
    faction: Faction;
    serialize(): T;
}

export type Deserializer<ST, T> = (game: Game, data: ST) => T;

export abstract class ModelContainer<ST, T extends IModel<ST>> {
    public items: {[id: string]: T};

    constructor(private typeName: string, private deserializer: Deserializer<ST, T>) {
        this.items = {};
    }

    public * all() {
        for (const id in this.items) {
            if (!this.items.hasOwnProperty(id)) {
                continue;
            }

            yield this.items[id];
        }
    }

    public * ofFaction(faction: Faction) {
        for (const item of this.all()) {
            if (item.faction.id === faction.id) {
                yield item;
            }
        }
    }

    public get(id: GS.ID) {
        const ret = this.items[id];
        if (!ret) {
            throw new Error(`No ${this.typeName} with id ${id}`);
        }

        return ret;
    }

    public add(item: T) {
        this.items[item.id] = item;

        item.emit("added");
        item.on("dead", () => {
            this.remove(item);
        });
    }

    public remove(item: T) {
        delete this.items[item.id];

        item.emit("removed");
        item.removeAllListeners();
    }

    public serialize() {
        const data: {[id: string]: ST} = {};
        for (const item of this.all()) {
            data[item.id] = item.serialize();
        }

        return data;
    }

    public deserialize(game: Game, data: any) {
        this.items = {};

        for (const id in data) {
            if (!data.hasOwnProperty(id)) {
                continue;
            }

            const item = this.deserializer(game, data[id]);
            this.add(item);
        }
    }
}
