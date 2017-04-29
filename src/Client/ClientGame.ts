import {Game} from "Common/Game";
import {TerrainSegment} from "Common/Models";
import {getHSL, Hex, Point} from "Common/Util";

import {IGameTime} from "./GameTime";

export class ClientGame extends Game {
    public draw(time: IGameTime, ctx: CanvasRenderingContext2D) {
        this.drawTerrain(ctx);
    }

    public drawHover(time: IGameTime, ctx: CanvasRenderingContext2D, hoverPoint: Point) {
        const hex = hoverPoint.toHex().round();

        const middlePoint = hex.toPoint();
        const points = hex.corners();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).map((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 16]);
        ctx.lineDashOffset = Math.floor(time.total / 16);
        ctx.stroke();
        ctx.setLineDash([]);
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
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = terrain.type.debugColor;
        ctx.fill();

        const fact = terrain.units[0] ? terrain.units[0].faction : null;

        if (fact) {
            ctx.fillStyle = getHSL(fact.order);

            ctx.beginPath();
            ctx.arc(middlePoint.x, middlePoint.y - 16, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(terrain.units.map((unit) => unit.type.name).join("\n"), middlePoint.x, middlePoint.y);
    }
}
