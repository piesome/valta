import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";
import {Point} from "Common/Util";

import {Camera, ICameraEvent} from "../Camera";
import {Client} from "../Client";
import {ClientGame} from "../ClientGame";
import {IGameTime} from "../GameTime";
import {Controls} from "./Controls";

const style = require("./GameInProgress.scss");

export interface IGameInProgressProps {
    client: Client;
    types: Types;
    game: ClientGame;
    switchToGameList: () => void;
}

export class GameInProgress extends React.Component<IGameInProgressProps, void> {
    private canvasElement: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationHandle: number;
    private camera: Camera;
    private hover: Point;

    constructor(props: IGameInProgressProps) {
        super(props);

        this.camera = new Camera();

        this.bindCanvasElement = this.bindCanvasElement.bind(this);
    }

    public componentWillUnmount() {
        window.cancelAnimationFrame(this.animationHandle);
    }

    public render() {
        return (
            <div className={style.game}>
                <Controls>
                    <button>Quit</button>
                </Controls>
                <div className={style.canvasContainer}>
                    <canvas ref={this.bindCanvasElement}/>
                </div>
            </div>
        );
    }

    private bindCanvasElement(canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement;
        this.recalculateSize();
        this.bindEvents();

        this.ctx = this.canvasElement.getContext("2d");
        this.draw();
    }

    private bindEvents() {
        this.camera.bindTo(this.canvasElement);
        this.camera.on("hover", (args: ICameraEvent) => {
            this.hover = args.point;
        });
        window.addEventListener("resize", (event) => {
            this.recalculateSize();
        });
    }

    /**
     * @todo dom event unbinds
     */
    private unbindEvents() {
        this.camera.removeAllListeners();
    }

    private recalculateSize() {
        this.canvasElement.width = (this.canvasElement.parentNode as HTMLDivElement).clientWidth;
        this.canvasElement.height = (this.canvasElement.parentNode as HTMLDivElement).clientHeight;
    }

    private draw(total = 0, previous = 0) {
        const time: IGameTime = {
            delta: previous - total,
            total,
        };

        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.ctx.restore();

        this.ctx.save();
        this.camera.applyToCtx(this.ctx);

        this.props.game.draw(time, this.ctx);

        if (this.hover) {
            this.props.game.drawHover(time, this.ctx, this.hover);
        }

        this.ctx.restore();

        this.animationHandle = window.requestAnimationFrame((timeNow) => this.draw(timeNow, time.total));
    }
}
