import {Game} from "../Game";
import * as GS from "../GameState";
import {UnitType} from "../Types";

import {NaturalResources} from "./NaturalResources";

export class ProductionQueue {
    public static deserialize(game: Game, data: GS.IProductionQueue): ProductionQueue {
        return new ProductionQueue(
            NaturalResources.deserialize(data.contributedCost),
            data.spawnBlocked,
            data.queue.map((name) => game.types.unit.getType(name)),
        );
    }

    constructor(
        public contributedCost: NaturalResources = new NaturalResources(),
        public spawnBlocked: boolean = false,
        public queue: UnitType[] = [],
    ) {}

    public pop(): UnitType {
        if (!this.isReady()) {
            throw new Error("Production queue isn't ready yet");
        }

        this.contributedCost = new NaturalResources();

        return this.queue.splice(0, 1)[0];
    }

    public neededResources(): NaturalResources {
        if (this.queue.length === 0) {
            return new NaturalResources();
        }

        return NaturalResources.deserialize(this.queue[0].cost).sub(this.contributedCost);
    }

    public isReady(): boolean {
        const needed = this.neededResources();
        return this.queue.length > 0 && !needed.food && !needed.production;
    }

    public takeResources(cityRes: NaturalResources): NaturalResources {
        const needed = this.neededResources();
        const toBeTaken = cityRes.min(needed);
        this.contributedCost = this.contributedCost.add(toBeTaken);
        return cityRes.sub(toBeTaken);
    }

    public serialize(): GS.IProductionQueue {
        return {
            contributedCost: this.contributedCost.serialize(),
            queue: this.queue.map((x) => x.name),
            spawnBlocked: this.spawnBlocked,
        };
    }
}
