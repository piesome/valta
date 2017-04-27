import * as R from "ramda";

import {Game} from "../Game";
import * as GS from "../GameState";
import {FactionType, IEffect, IEffectTarget, UpgradeType} from "../Types";

export class Faction {
    public static deserialize(game: Game, data: GS.IFaction): Faction {
        return new Faction(
            data.id,
            game.types.faction.getType(data.factionType),
            data.canAct,
            data.unlockedUpgrades.map((x) => game.types.upgrade.getType(x)),
            data.order,
        );
    }

    constructor(
        public id: GS.ID,
        public type: FactionType,
        public canAct: boolean,
        public upgrades: UpgradeType[],
        public order: number,
    ) {}

    public effects(): IEffect[] {
        return R.flatten(R.map((x) => x.effects, this.upgrades));
    }

    public effectsFor(target: IEffectTarget): IEffect[] {
        return R.filter((x) => R.equals(x.target, target), this.effects());
    }

    public serialize(): GS.IFaction {
        return {
            canAct: this.canAct,
            factionType: this.type.name,
            id: this.id,
            order: this.order,
            unlockedUpgrades: this.upgrades.map((x) => x.name),
        };
    }
}
