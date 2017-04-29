import {Hex} from "./Hex";

export class Cube {
    constructor(
        public x: number,
        public y: number,
        public z: number,
    ) {}

    public round(): Cube {
        let rx = Math.round(this.x);
        let ry = Math.round(this.y);
        let rz = Math.round(this.z);

        const xDiff = Math.abs(rx - this.x);
        const yDiff = Math.abs(ry - this.y);
        const zDiff = Math.abs(rz - this.z);

        if (xDiff > yDiff && xDiff > zDiff) {
            rx = -ry - rz;
        } else if (yDiff > zDiff) {
            ry = -rx - rz;
        } else {
            rz = -rx - ry;
        }

        return new Cube(rx, ry, rz);
    }

    public toHex(): Hex {
        return new Hex(this.x, this.z);
    }
}
