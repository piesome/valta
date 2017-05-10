import {EventEmitter} from "eventemitter3";
import * as R from "ramda";

import {Hex, Point} from "Common/Util";

export interface ICameraEvent {
    button: number;
    point: Point;
    hex: Hex;
}

export interface ICameraOptions {
    panButton?: number;
    panMin?: number;

    zoomMax?: number;
    zoomMin?: number;
    zoomSpeed?: number;

    // todo: bounds
}

const defaultOptions: ICameraOptions = {
    panButton: 0,
    panMin: 20,

    zoomMax: 5,
    zoomMin: 0.35,
    zoomSpeed: 0.3,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(min, value), max);
}

function dist(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export class Camera extends EventEmitter {
    public zoomLevel: number = 1;
    public panX: number = 0;
    public panY: number = 0;

    private options: ICameraOptions;

    private inPan: boolean = false;
    private inClick: boolean = false;
    private clickX: number;
    private clickY: number;
    private clickOffsetX: number;
    private clickOffsetY: number;

    constructor(options: ICameraOptions = {}) {
        super();

        this.options = R.merge(defaultOptions, options);
    }

    public bindTo(canvasElement: HTMLCanvasElement) {
        canvasElement.addEventListener("wheel", (event) => {
            const delta = Math.exp((event.deltaY > 0 ? -1 : 1) * this.options.zoomSpeed);
            const zoomNow = this.zoomLevel;

            this.zoomLevel = clamp(this.zoomLevel * delta, this.options.zoomMin, this.options.zoomMax);

            const mouseX = (event.offsetX - this.panX);
            const mouseY = (event.offsetY - this.panY);

            this.panX += mouseX - (mouseX * (this.zoomLevel / zoomNow));
            this.panY += mouseY - (mouseY * (this.zoomLevel / zoomNow));

            this.emit("update");
            event.preventDefault();
        }, true);

        canvasElement.addEventListener("mousedown", (event) => {
            if (event.button !== this.options.panButton) {
                return;
            }
            this.inClick = true;
            this.clickX = this.panX - event.offsetX;
            this.clickY = this.panY - event.offsetY;
            this.clickOffsetX = event.offsetX;
            this.clickOffsetY = event.offsetY;

            event.preventDefault();
        }, true);

        canvasElement.addEventListener("mousemove", (event) => {
            if (!this.inPan) {
                if (this.inClick
                    && dist(this.clickOffsetX, this.clickOffsetY, event.offsetX, event.offsetY) > this.options.panMin) {

                    this.inPan = true;
                } else {
                    this.emitHover(event);
                    return;
                }
            }

            this.panX = this.clickX + event.offsetX;
            this.panY = this.clickY + event.offsetY;

            this.emit("update");
        }, true);

        canvasElement.addEventListener("mouseup", (event) => {
            if (!this.inPan) {
                this.emitSelect(event);
                return;
            }

            if (event.button !== this.options.panButton) {
                return;
            }

            this.inPan = false;
            this.inClick = false;
        }, true);

        canvasElement.addEventListener("mouseleave", (event) => {
            this.inPan = false;
            this.inClick = false;
        }, true);

        canvasElement.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            return false;
        }, true);
    }

    private createEvent(event: MouseEvent): ICameraEvent {
        const point = new Point(
            (event.offsetX - this.panX) / this.zoomLevel,
            (event.offsetY - this.panY) / this.zoomLevel,
        );
        return {
            button: event.button,
            point,
            hex: point.toHex().round(),
        };
    }

    private emitSelect(event: MouseEvent) {
        this.emit("select", this.createEvent(event));
        this.inClick = false;
    }

    private emitHover(event: MouseEvent) {
        this.emit("hover", this.createEvent(event));
    }
}
