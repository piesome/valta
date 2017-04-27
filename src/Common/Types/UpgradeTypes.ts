import * as R from "ramda";

import {IEffect, TypeManager, UpgradeType} from ".";

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
            data.effects.map((x: any) => x as IEffect),
        );
    }
}
