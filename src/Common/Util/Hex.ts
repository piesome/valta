/**
 * http://www.redblobgames.com/grids/hexagons/
 */

import {Cube} from "./Cube";
import {Point} from "./Point";

// dunno lol
export const HEX_SIZE = 32;

export class Hex {
    constructor(
        public q: number,
        public r: number,
    ) {}

    public neighbor(direction: number): Hex {
        const dir = AXIAL_DIRECTIONS[direction];
        return new Hex(
            this.q + dir.q,
            this.r + dir.r,
        );
    }

    public neighbours(): Hex[] {
        return [0, 1, 2, 3, 4, 5].map((dir) => this.neighbor(dir));
    }

    public toPoint(): Point {
        return new Point(
            HEX_SIZE * (3 / 2) * this.q,
            HEX_SIZE * Math.sqrt(3) * (this.r + this.q / 2),
        );
    }

    public cornerOffset(direction: number): Point {
        const angle = Math.PI / 180 * (60 * direction);
        return new Point(
            HEX_SIZE * Math.cos(angle),
            HEX_SIZE * Math.sin(angle),
        );
    }

    public corners(): Point[] {
        const center = this.toPoint();
        return [0, 1, 2, 3, 4, 5].map((dir) => center.add(this.cornerOffset(dir)));
    }

    public toCube(): Cube {
        return new Cube(
            this.q,
            -this.q - this.r,
            this.r,
        );
    }

    public round(): Hex {
        return this.toCube().round().toHex();
    }
}

export const AXIAL_DIRECTIONS = [
    new Hex(1, 0), new Hex(1, -1), new Hex(0, -1),
    new Hex(-1, 0), new Hex(-1, 1), new Hex(0, 1),
];
