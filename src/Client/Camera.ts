import {EventEmitter} from "eventemitter3";
import * as R from "ramda";

import {Point} from "Common/Util";

export interface ICameraEvent {
    button: number;
    point: Point;
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
    private options: ICameraOptions;

    private zoomLevel: number = 1;
    private panX: number = 0;
    private panY: number = 0;
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
    }

    public applyToCtx(ctx: CanvasRenderingContext2D) {
        ctx.setTransform(this.zoomLevel, 0, 0, this.zoomLevel, this.panX, this.panY);
    }

    private createEvent(event: MouseEvent): ICameraEvent {
        return {
            button: event.button,
            point: new Point(
                (event.offsetX - this.panX) / this.zoomLevel,
                (event.offsetY - this.panY) / this.zoomLevel,
            ),
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
