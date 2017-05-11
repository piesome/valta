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
        public contributedCost: GS.INaturalResources = {food: 0, production: 0},
        public spawnBlocked: boolean = false,
        public queue: UnitType[] = [],
    ) {}

    public pop(): UnitType {
        if (!this.isReady()) {
            throw new Error("Production queue isn't ready yet");
        }

        this.contributedCost = {food: 0, production: 0};

        return this.queue.splice(0, 1)[0];
    }

    public neededResources(): GS.INaturalResources {
        if (this.queue.length === 0) {
            return {};
        }

        const base = Object.assign({}, this.queue[0].cost);

        if (base.food) {
            base.food -= (this.contributedCost.food || 0);
        }
        if (base.production) {
            base.production -= (this.contributedCost.production || 0);
        }

        return base;
    }

    public isReady(): boolean {
        const needed = this.neededResources();
        return this.queue.length > 0 && !needed.food && !needed.production;
    }

    public takeResources(cityRes: GS.INaturalResources): GS.INaturalResources {
        const needed = this.neededResources();
        const ret = Object.assign({}, cityRes);

        if (needed.food && ret.food) {
            const take = Math.min(ret.food, needed.food);
            this.contributeFood(take);
            ret.food -= take;
        }

        if (needed.production && ret.production) {
            const take = Math.min(ret.production, needed.production);
            this.contributeProduction(take);
            ret.production -= take;
        }

        return ret;
    }

    public serialize(): GS.IProductionQueue {
        return {
            contributedCost: this.contributedCost,
            queue: this.queue.map((x) => x.name),
            spawnBlocked: this.spawnBlocked,
        };
    }

    private contributeFood(val: number) {
        if (!this.contributedCost.food) {
            this.contributedCost.food = 0;
        }

        this.contributedCost.food += val;
    }

    private contributeProduction(val: number) {
        if (!this.contributedCost.production) {
            this.contributedCost.production = 0;
        }

        this.contributedCost.production += val;
    }
}
