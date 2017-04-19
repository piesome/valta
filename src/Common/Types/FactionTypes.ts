import {FactionType, TypeManager} from ".";

export class FactionTypes extends TypeManager<FactionType> {
    constructor() {
        super();
        this.typeName = "faction";
    }

    public possible() {
        return Object.keys(this.types);
    }

    public transformRaw(data: any): FactionType {
        return new FactionType(
            data.name,
        );
    }
}
