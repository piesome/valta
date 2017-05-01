import {Game} from "Common/Game";
import {City, TerrainSegment, Unit} from "Common/Models";
import {getHSL, Hex, Point} from "Common/Util";

import {IGameTime} from "./GameTime";

export class ClientGame extends Game {
    public draw(time: IGameTime, ctx: CanvasRenderingContext2D) {
        this.drawTerrain(ctx);
    }

    public drawHover(time: IGameTime, ctx: CanvasRenderingContext2D, hex: Hex) {
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

        middlePoint.y -= 13;

        if (terrain.city) {
            this.drawCity(middlePoint, terrain.city, ctx);
            middlePoint.y += 13;
        }

        for (const unit of terrain.units) {
            this.drawUnit(middlePoint, unit, ctx);
            middlePoint.y += 13;
        }
    }

    private drawCity(middlePoint: Point, city: City, ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#333";
        ctx.fillStyle = getHSL(city.faction.order);

        const displayedName = city.name.length > 10 ? city.name.substr(0, 10) : city.name;
        const width = ctx.measureText(displayedName).width;

        ctx.beginPath();
        ctx.rect(middlePoint.x - (width / 2) - 1, middlePoint.y - 10, width + 2, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";

        ctx.fillText(displayedName, middlePoint.x, middlePoint.y);
    }

    private drawUnit(middlePoint: Point, unit: Unit, ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#333";
        ctx.fillStyle = getHSL(unit.faction.order);

        const displayedName = unit.type.name.length > 10 ? unit.type.name.substr(0, 10) : unit.type.name;
        const width = ctx.measureText(displayedName).width;

        ctx.beginPath();
        ctx.arc(middlePoint.x - (width / 2) + 4, middlePoint.y - 2, 6, Math.PI / 2, Math.PI * 3 / 2);
        ctx.arc(middlePoint.x + (width / 2) - 4, middlePoint.y - 2, 6, Math.PI * 3 / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";

        ctx.fillText(displayedName, middlePoint.x, middlePoint.y);
    }
}
