import {injectable} from "inversify";

import {TypeManager} from "./TypeManager";

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
    constructor() {
        super();
        this.typeName = "faction";
    }

    transformRaw(data: any): FactionType {
        return new FactionType(
            data.name
        );
    }
}

