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
export class TerrainTypeManager extends TypeManager<TerrainType> {
    constructor(
        @inject(DataManager) dataManager: DataManager
    ) {
        super(dataManager);
        this.typeName = "terrain";
    }

    transformRaw(data: any): TerrainType {
        return new TerrainType(
            data.name,
            data.movementPenalty
        );
    }
}
