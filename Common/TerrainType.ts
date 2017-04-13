import {inject, injectable} from "inversify";

import {TypeManager} from "./TypeManager";
import {DataManager, RawTypes} from "./DataManager";

export class TerrainType {
    constructor(
        public name: string,
        public movementPenalty: number
    ) {}
}

/**
 * Singleton for managing TerrainType
 */
@injectable()
export class TerrainTypeManager implements TypeManager<TerrainType> {
    public types: {[name: string]: TerrainType};

    constructor(
        @inject(DataManager) private dataManager: DataManager
    ) {
        this.types = {};
    }

    getType(name: string): TerrainType {
        return this.types[name];
    }

    async load() {
        try {
            const data = await this.dataManager.loadTypes("terrain");
            this.loadData(data);
        } catch (err) {
            throw err;
        }
    }

    private loadData(rawTypes: RawTypes) {
        for (const name in rawTypes) {
            const data = rawTypes[name];
            const type = new TerrainType(name, data.movementPenalty);
            this.types[name] = type;
        }
    }
}
