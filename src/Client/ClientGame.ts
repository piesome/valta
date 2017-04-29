import {Game} from "Common/Game";
import {TerrainSegment} from "Common/Models";
import {Hex, Point} from "Common/Util";

export class ClientGame extends Game {
    public draw(ctx: CanvasRenderingContext2D) {
        this.drawTerrain(ctx);
    }

    public drawHover(ctx: CanvasRenderingContext2D, hoverPoint: Point) {
        const hex = hoverPoint.toHex().round();

        const middlePoint = hex.toPoint();
        const points = hex.corners();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).map((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();

        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
    }

    private drawTerrain(ctx: CanvasRenderingContext2D) {
        for (const row in this.terrain) {
            if (!this.terrain.hasOwnProperty(row)) {
                continue;
            }

            for (const column in this.terrain[row]) {
                if (!this.terrain[row].hasOwnProperty(column)) {
                    continue;
                }

                this.drawTerrainSegment(this.terrain[row][column], ctx);
            }
        }
    }

    private drawTerrainSegment(terrain: TerrainSegment, ctx: CanvasRenderingContext2D) {
        const middlePoint = terrain.toPoint();
        const points = terrain.corners();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).map((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();

        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.fillStyle = terrain.type.debugColor;
        ctx.fill();

        ctx.fillText(terrain.units.map((unit) => unit.type.name).join(" "), middlePoint.x, middlePoint.y);
    }
}
