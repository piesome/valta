import {TerrainType, TypeManager} from ".";

export class TerrainTypes extends TypeManager<TerrainType> {
    constructor() {
        super();
        this.typeName = "terrain";
    }

    public transformRaw(data: any): TerrainType {
        return new TerrainType(
            data.name,
            data.movementPenalty,
            data.debugColor,
        );
    }
}
