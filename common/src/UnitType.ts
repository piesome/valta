import {TypeManager} from "./TypeManager";

export class UnitType {
    constructor(
        public name: string,
        public health: number,
        public damage: number,
        public actions: string[]
    ) {}
}

export class UnitTypeManager extends TypeManager<UnitType> {
    constructor() {
        super();
        this.typeName = "unit";
    }

    transformRaw(data: any): UnitType {
        return new UnitType(
            data.name,
            data.heath,
            data.damage,
            data.actions
        );
    }
}
