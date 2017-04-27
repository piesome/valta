import {Game} from "Common/Game";
import {TerrainSegment} from "Common/Models";
import {IHex, IPoint} from "Common/Util";

function hexToPoint(hex: IHex, size: number): IPoint {
    return {
        x: size * 3 / 2 * hex.x,
        y: size * Math.sqrt(3) * (hex.y + hex.x / 2),
    };
}

function corner(center: IPoint, i: number, size: number) {
    const angleDeg = 60 * i;
    const angleRad = Math.PI / 180 * angleDeg;
    return {
        x: center.x + size * Math.cos(angleRad),
        y: center.y + size * Math.sin(angleRad),
    };
}

export class ClientGame extends Game {
    public draw(ctx: CanvasRenderingContext2D) {
        this.drawTerrain(ctx);
    }

    private drawTerrain(ctx: CanvasRenderingContext2D) {
        for (const xkey in this.terrain) {
            if (!this.terrain.hasOwnProperty(xkey)) {
                continue;
            }

            for (const ykey in this.terrain[xkey]) {
                if (!this.terrain[xkey].hasOwnProperty(ykey)) {
                    continue;
                }

                for (const zkey in this.terrain[xkey][ykey]) {
                    if (!this.terrain[xkey][ykey].hasOwnProperty(zkey)) {
                        continue;
                    }

                    this.drawTerrainSegment(this.terrain[xkey][ykey][zkey], ctx);
                }
            }
        }
    }

    private drawTerrainSegment(terrain: TerrainSegment, ctx: CanvasRenderingContext2D) {
        // fix
        const middlePoint = hexToPoint(terrain, 32);
        const points = [0, 1, 2, 3, 4, 5].map((i) => corner(middlePoint, i, 32));
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).map((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.stroke();
    }
}
