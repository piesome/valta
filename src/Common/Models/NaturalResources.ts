import * as GS from "../GameState";

export class NaturalResources {
    public static deserialize(data: GS.INaturalResources) {
        return new NaturalResources(
            data.food,
            data.production,
        );
    }

    constructor(
        public food = 0,
        public production = 0,
    ) {}

    public add(other: NaturalResources) {
        return new NaturalResources(
            this.food + (other.food || 0),
            this.production + (other.production || 0),
        );
    }

    public sub(other: NaturalResources | GS.INaturalResources) {
        return new NaturalResources(
            this.food - (other.food || 0),
            this.production - (other.production || 0),
        );
    }

    public min(other: NaturalResources) {
        return new NaturalResources(
            Math.min(this.food, other.food),
            Math.min(this.production, other.production),
        );
    }

    public serialize() {
        return {
            food: this.food,
            production: this.production,
        };
    }
}
