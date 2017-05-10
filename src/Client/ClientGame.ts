import * as PIXI from "pixi.js";
import * as tinycolor from "tinycolor2";

import {Game} from "Common/Game";
import {City, Faction, TerrainSegment, Unit} from "Common/Models";
import {Types} from "Common/Types";
import {getHSL, Hex, HEX_SIZE, Point} from "Common/Util";
import {data} from "../../data";

import {IGameTime} from "./GameTime";

export class ClientGame extends Game {
    private textures: {[key: string]: PIXI.Texture};

    constructor(types: Types) {
        super(types);

        this.textures = {};

        this.loadTexture("plains", data.terrain["plains.svg"]);
        this.loadTexture("select", data.ui["select.svg"]);
    }

    public drawTerrain(container: PIXI.Container) {
        for (const terrain of this.terrains()) {
            this.drawTerrainSegment(terrain, container);
        }
    }

    public drawOutlines(container: PIXI.Container) {
        for (const terrain of this.terrains()) {
            const neigh = terrain.neighbours().map((n) => this.getTerrainSegmentByHex(n));
            this.drawTerrainOutline(terrain, neigh, container);
        }
    }

    public drawHover(container: PIXI.Container, hex: Hex) {
        const point = hex.toPoint();

        const test = new PIXI.Sprite(this.textures["select"]); // tslint:disable-line
        test.width = 64;
        test.height = 64;
        test.x = point.x;
        test.y = point.y;
        test.anchor.set(0.5, 0.5);
        container.addChild(test);
    }

    public drawUnits(container: PIXI.Container) {
        for (const terrain of this.terrains()) {
            this.drawTerrainUnits(terrain, container);
        }
    }

    private loadTexture(name: string, data: any) {
        this.textures[name] = PIXI.Texture.fromImage(data, false, PIXI.SCALE_MODES.LINEAR, 3);
    }

    private drawTerrainSegment(terrain: TerrainSegment, container: PIXI.Container) {
        const point = terrain.toPoint();

        const test = new PIXI.Sprite(this.textures[terrain.type.name]);
        test.width = 64;
        test.height = 64;
        test.x = point.x;
        test.y = point.y;
        test.anchor.set(0.5, 0.5);
        container.addChild(test);
    }

    private drawTerrainUnits(terrain: TerrainSegment, container: PIXI.Container) {
        const middlePoint = terrain.toPoint();

        middlePoint.y -= 20;

        if (terrain.city) {
            this.drawCity(middlePoint, terrain.city, container);
            middlePoint.y += 20;
        }

        for (const unit of terrain.units) {
            this.drawUnit(middlePoint, unit, container);
            middlePoint.y += 20;
        }
    }

    private drawCity(point: Point, city: City, container: PIXI.Container) {
        const textStyle: PIXI.TextStyleOptions = {
            align: "center",
            fill: 0xffffff,
            fontFamily: "Arial",
            fontSize: 64,
        };

        const text = new PIXI.Text(city.name.substr(0, 10), textStyle);
        text.x = point.x;
        text.y = point.y;

        const scale = 6;
        text.height /= scale;
        text.width /= scale;
        text.anchor.x = 0.5;

        const color = tinycolor(getHSL(city.faction.order)).toRgb();

        const bg = new PIXI.Graphics();
        bg.beginFill(PIXI.utils.rgb2hex([color.r / 255, color.g / 255, color.b / 255]));
        bg.lineStyle(1, 0x000000);
        bg.drawRect(0, 0, text.width + 4, text.height + 4);
        bg.x = point.x - text.width / 2 - 2;
        bg.y = point.y - text.height / 2 + 4;

        container.addChild(bg);
        container.addChild(text);
    }

    private drawUnit(point: Point, unit: Unit, container: PIXI.Container) {
        const textStyle: PIXI.TextStyleOptions = {
            align: "center",
            fill: 0xffffff,
            fontFamily: "Arial",
            fontSize: 64,
        };

        const text = new PIXI.Text(unit.type.name, textStyle);
        text.x = point.x;
        text.y = point.y;

        const scale = 6;
        text.height /= scale;
        text.width /= scale;
        text.anchor.x = 0.5;

        const color = tinycolor(getHSL(unit.faction.order)).toRgb();

        const bg = new PIXI.Graphics();
        bg.beginFill(PIXI.utils.rgb2hex([color.r / 255, color.g / 255, color.b / 255]));
        bg.lineStyle(1, 0x000000);
        bg.arc(0, 0, 6, Math.PI / 2, Math.PI * 3 / 2);
        bg.arc(text.width, 0, 6, Math.PI * 3 / 2, Math.PI / 2);
        bg.lineTo(0, 6);
        bg.x = point.x - text.width / 2;
        bg.y = point.y + text.height / 2;

        container.addChild(bg);
        container.addChild(text);
    }

    private drawTerrainOutline(terrain: TerrainSegment, neighbours: TerrainSegment[], container: PIXI.Container) {
        if (!terrain.ownedBy) {
            return;
        }

        const middlePoint = terrain.toPoint();
        const points = terrain.corners(HEX_SIZE - 1);

        this.conditionallyDrawCityOutline(points[0], points[1], terrain.ownedBy.faction, neighbours[0], container);
        this.conditionallyDrawCityOutline(points[1], points[2], terrain.ownedBy.faction, neighbours[5], container);
        this.conditionallyDrawCityOutline(points[2], points[3], terrain.ownedBy.faction, neighbours[4], container);
        this.conditionallyDrawCityOutline(points[3], points[4], terrain.ownedBy.faction, neighbours[3], container);
        this.conditionallyDrawCityOutline(points[4], points[5], terrain.ownedBy.faction, neighbours[2], container);
        this.conditionallyDrawCityOutline(points[5], points[0], terrain.ownedBy.faction, neighbours[1], container);
    }

    private conditionallyDrawCityOutline(
        point1: Point,
        point2: Point,
        faction: Faction,
        neighbour: TerrainSegment,
        container: PIXI.Container,
    ) {
        if (neighbour && neighbour.ownedBy && neighbour.ownedBy.faction.id === faction.id) {
            return;
        }

        const line = new PIXI.Graphics();

        const color = tinycolor(getHSL(faction.order)).toRgb();

        line.lineStyle(2, PIXI.utils.rgb2hex([color.r / 255, color.g / 255, color.b / 255]));

        line.moveTo(point1.x, point1.y);
        line.lineTo(point2.x, point2.y);

        container.addChild(line);
    }
}
