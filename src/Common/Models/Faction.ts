import * as R from "ramda";

import {Game} from "../Game";
import * as GS from "../GameState";
import {FactionType, Improvement, ImprovementTarget, UpgradeType} from "../Types";

export class Faction {
    public static deserialize(game: Game, data: GS.IFaction): Faction {
        return new Faction(
            data.id,
            game.types.faction.getType(data.factionType),
            data.canAct,
            data.unlockedUpgrades.map((x) => game.types.upgrade.getType(x)),
            data.peerId,
            data.order,
        );
    }

    constructor(
        public id: GS.ID,
        public type: FactionType,
        public canAct: boolean,
        public upgrades: UpgradeType[],
        public peerId: GS.ID,
        public order: number,
    ) {}

    public improvements(): Improvement[] {
        return R.flatten(R.map((x) => x.improvements, this.upgrades));
    }

    public improvementsFor(target: ImprovementTarget): Improvement[] {
        return R.filter((x) => R.equals(x.target, target), this.improvements());
    }

    public serialize(): GS.IFaction {
        return {
            canAct: this.canAct,
            factionType: this.type.name,
            id: this.id,
            order: this.order,
            peerId: this.peerId,
            unlockedUpgrades: this.upgrades.map((x) => x.name),
        };
    }
}
