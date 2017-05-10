/**
 * http://www.redblobgames.com/grids/hexagons/
 */

import {Cube} from "./Cube";
import {Point} from "./Point";

// dunno lol
export const HEX_SIZE = 32;
export const HEX_POSITION_SIZE = 32;

export class Hex {
    public static deserializeHex(data: any) {
        return new Hex(data.q, data.r);
    }

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
            HEX_POSITION_SIZE * (3 / 2) * this.q,
            HEX_POSITION_SIZE * Math.sqrt(3) * (this.r + this.q / 2),
        );
    }

    public cornerOffset(direction: number, size = HEX_SIZE): Point {
        const angle = Math.PI / 180 * (60 * direction);
        return new Point(
            size * Math.cos(angle),
            size * Math.sin(angle),
        );
    }

    public corners(size = HEX_SIZE): Point[] {
        const center = this.toPoint();
        return [0, 1, 2, 3, 4, 5].map((dir) => center.add(this.cornerOffset(dir, size)));
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

    public distanceTo(other: Hex): number {
        return (
            Math.abs(this.q - other.q)
            + Math.abs(this.q + this.r - other.q - other.r)
            + Math.abs(this.r - other.r)
        ) / 2;
    }

    public sum(other: Hex): Hex {
        if (!other) {
            return this;
        }

        return new Hex(
            this.q + other.q,
            this.r + other.r,
        );
    }

    public diff(other: Hex): Hex {
        return new Hex(
            this.q - other.q,
            this.r - other.r,
        );
    }

    public equals(other: Hex): boolean {
        return this.q === other.q && this.r === other.r;
    }

    public hash(): string {
        return `${this.q},${this.r}`;
    }

    public serializeHex() {
        return {
            q: this.q,
            r: this.r,
        };
    }
}

export const AXIAL_DIRECTIONS = [
    new Hex(1, 0), new Hex(1, -1), new Hex(0, -1),
    new Hex(-1, 0), new Hex(-1, 1), new Hex(0, 1),
];
