import {Game} from "../Game";
import * as GS from "../GameState";
import {UnitType} from "../Types";

export class ProductionQueue {
    public static deserialize(game: Game, data: GS.IProductionQueue): ProductionQueue {
        return new ProductionQueue(
            data.contributedCost,
            data.spawnBlocked,
            data.queue.map((name) => game.types.unit.getType(name)),
        );
    }

    constructor(
        public contributedCost: GS.INaturalResources = {},
        public spawnBlocked: boolean = false,
        public queue: UnitType[] = [],
    ) {}

    public serialize(): GS.IProductionQueue {
        return {
            contributedCost: this.contributedCost,
            queue: this.queue.map((x) => x.name),
            spawnBlocked: this.spawnBlocked,
        };
    }
}
