import {TypeManager} from "./TypeManager";

export class TerrainType {
    constructor(
        public name: string,
        public movementPenalty: number,
    ) {}
}

export class TerrainTypeManager extends TypeManager<TerrainType> {
    constructor() {
        super();
        this.typeName = "terrain";
    }

    transformRaw(data: any): TerrainType {
        return new TerrainType(
            data.name,
            data.movementPenalty,
        );
    }
}
