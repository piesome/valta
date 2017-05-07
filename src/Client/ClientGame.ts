import {Game} from "Common/Game";
import {City, Faction, TerrainSegment, Unit} from "Common/Models";
import {getHSL, Hex, HEX_SIZE, Point} from "Common/Util";

import {IGameTime} from "./GameTime";

export class ClientGame extends Game {
    public drawTerrain(ctx: CanvasRenderingContext2D) {
        for (const terrain of this.terrains()) {
            this.drawTerrainSegment(terrain, ctx);
        }
    }

    public drawOutlines(ctx: CanvasRenderingContext2D) {
        for (const terrain of this.terrains()) {
            const neigh = terrain.neighbours().map((n) => this.getTerrainSegmentByHex(n));
            this.drawTerrainOutline(terrain, neigh, ctx);
        }
    }

    public drawHover(time: IGameTime, ctx: CanvasRenderingContext2D, hex: Hex) {
        const middlePoint = hex.toPoint();
        const points = hex.corners(HEX_SIZE - 1);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).map((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.setLineDash([15.5, 15.5]);
        ctx.lineDashOffset = Math.floor(time.total / 16);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    public drawUnits(ctx: CanvasRenderingContext2D) {
        for (const terrain of this.terrains()) {
            this.drawTerrainUnits(terrain, ctx);
        }
    }

    private drawTerrainSegment(terrain: TerrainSegment, ctx: CanvasRenderingContext2D) {
        const middlePoint = terrain.toPoint();
        const points = terrain.corners();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).map((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();

        ctx.fillStyle = terrain.type.debugColor;
        ctx.fill();
    }

    private drawTerrainUnits(terrain: TerrainSegment, ctx: CanvasRenderingContext2D) {
        const middlePoint = terrain.toPoint();

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

    private drawTerrainOutline(terrain: TerrainSegment, neighbours: TerrainSegment[], ctx: CanvasRenderingContext2D) {
        if (!terrain.ownedBy) {
            return;
        }

        const middlePoint = terrain.toPoint();
        const points = terrain.corners(HEX_SIZE - 1);

        this.conditionallyDrawCityOutline(points[0], points[1], terrain.ownedBy.faction, neighbours[0], ctx);
        this.conditionallyDrawCityOutline(points[1], points[2], terrain.ownedBy.faction, neighbours[5], ctx);
        this.conditionallyDrawCityOutline(points[2], points[3], terrain.ownedBy.faction, neighbours[4], ctx);
        this.conditionallyDrawCityOutline(points[3], points[4], terrain.ownedBy.faction, neighbours[3], ctx);
        this.conditionallyDrawCityOutline(points[4], points[5], terrain.ownedBy.faction, neighbours[2], ctx);
        this.conditionallyDrawCityOutline(points[5], points[0], terrain.ownedBy.faction, neighbours[1], ctx);
    }

    private conditionallyDrawCityOutline(
        point1: Point,
        point2: Point,
        faction: Faction,
        neighbour: TerrainSegment,
        ctx: CanvasRenderingContext2D,
    ) {
        if (neighbour && neighbour.ownedBy && neighbour.ownedBy.faction.id === faction.id) {
            return;
        }

        ctx.beginPath();
        ctx.strokeStyle = getHSL(faction.order);
        ctx.lineWidth = 2;
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
    }
}
