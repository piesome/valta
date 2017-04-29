import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Camera} from "../Camera";
import {Client} from "../Client";
import {ClientGame} from "../ClientGame";
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

        this.canvasElement.width = (this.canvasElement.parentNode as HTMLDivElement).clientWidth;
        this.canvasElement.height = (this.canvasElement.parentNode as HTMLDivElement).clientHeight;
        this.camera.bindTo(this.canvasElement);

        this.ctx = this.canvasElement.getContext("2d");
        this.draw();
    }

    private draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.ctx.restore();

        this.ctx.save();
        this.camera.applyToCtx(this.ctx);

        this.props.game.draw(this.ctx);
        this.ctx.restore();

        this.animationHandle = window.requestAnimationFrame(() => this.draw());
    }
}
