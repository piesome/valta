import {Hex, HEX_SIZE} from "./Hex";

export class Point {
    constructor(
        public x: number,
        public y: number,
    ) {}

    public add(other: Point) {
        return new Point(
            this.x + other.x,
            this.y + other.y,
        );
    }

    public toHex(): Hex {
        return new Hex(
            this.x * 2 / 3 / HEX_SIZE,
            (-this.x / 3 + Math.sqrt(3) / 3 * this.y) / HEX_SIZE,
        );
    }
}
