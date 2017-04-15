import * as R from "ramda";

import {TypeManager} from "./TypeManager";
import {Improvement} from "./Improvement";

export class UpgradeType {
    constructor(
        public name: string,
        public dependsOn: string[],
        public automaticallyUnlocked: boolean,
        public improvements: Improvement[]
    ) {}
}

export class UpgradeTypeManager extends TypeManager<UpgradeType> {
    constructor() {
        super();
        this.typeName = "upgrade";
    }

    automaticallyUnlocked(): UpgradeType[] {
        return R.filter(x => x.automaticallyUnlocked, R.values(this.types));
    }

    transformRaw(data: any): UpgradeType {
        return new UpgradeType(
            data.name,
            data.dependsOn,
            data.automaticallyUnlocked,
            data.improvements.map((x: any) => <Improvement>x)
        );
    }
}
