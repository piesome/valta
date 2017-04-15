import * as GS from "../GameState";
import {FactionType, UpgradeType} from "../Types";
import {Game} from "../Game";

export class Faction {
    constructor(
        public id: GS.ID,
        public type: FactionType,
        public canAct: boolean,
        public upgrades: UpgradeType[]
    ) {}

    static deserialize(game: Game, data: GS.Faction): Faction {
        return new Faction(
            data.id,
            game.types.faction.getType(data.factionType),
            data.canAct,
            data.unlockedUpgrades.map(x => game.types.upgrade.getType(x))
        );
    }

    public serialize(): GS.Faction {
        return {
            id: this.id,
            factionType: this.type.name,
            canAct: this.canAct,
            unlockedUpgrades: this.upgrades.map(x => x.name)
        };
    }
}
