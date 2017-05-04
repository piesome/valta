import {BuildingType, TypeManager} from ".";

export class BuildingTypes extends TypeManager<BuildingType> {
    constructor() {
        super();
        this.typeName = "building";
    }

    public transformRaw(data: any): BuildingType {
        return new BuildingType(
            data.name,
            data.cost,
        );
    }
}
