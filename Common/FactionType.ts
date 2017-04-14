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
export class FactionTypeManager extends TypeManager<FactionType> {
    constructor(
        @inject(DataManager) dataManager: DataManager
    ) {
        super(dataManager);
        this.typeName = "factions";
    }

    transformRaw(data: any): FactionType {
        return new FactionType(
            data.name
        );
    }
}

