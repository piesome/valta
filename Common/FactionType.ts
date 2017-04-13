import {inject, injectable} from "inversify";

import {TypeManager} from "./TypeManager";
import {DataManager, RawTypes} from "./DataManager";

export class FactionType {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
}

/**
 * Singleton for managing FactionTypes
 */
@injectable()
export class FactionTypeManager implements TypeManager<FactionType> {
    private types: {[name: string]: FactionType};

    constructor(
        @inject(DataManager) private dataManager: DataManager
    ) {
        this.types = {};
    }

    getType(name: string): FactionType {
        return this.types[name];
    }

    async load() {
        try {
            const data = await this.dataManager.loadTypes("factions");
            this.loadData(data);
        } catch (err) {
            throw err;
        }
    }

    private loadData(rawTypes: RawTypes) {
        for (const name in rawTypes) {
            const type = new FactionType(name);
            this.types[name] = type;
        }
    }
}
