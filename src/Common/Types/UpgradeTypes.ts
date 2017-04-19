import * as R from "ramda";

import {Improvement, TypeManager, UpgradeType} from ".";

export class UpgradeTypes extends TypeManager<UpgradeType> {
    constructor() {
        super();
        this.typeName = "upgrade";
    }

    public automaticallyUnlocked(): UpgradeType[] {
        return R.filter((x) => x.automaticallyUnlocked, R.values(this.types));
    }

    public transformRaw(data: any): UpgradeType {
        return new UpgradeType(
            data.name,
            data.dependsOn,
            data.automaticallyUnlocked,
            data.improvements.map((x: any) => x as Improvement),
        );
    }
}
