import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

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
    private scale: number;
    private offsetX: number;
    private offsetY: number;
    private clickX: number;
    private clickY: number;
    private isPanning: boolean;

    constructor(props: IGameInProgressProps) {
        super(props);

        this.scale = 1;
        this.isPanning = false;

        this.bindCanvasElement = this.bindCanvasElement.bind(this);
    }

    public componentWillUnmount() {
        window.cancelAnimationFrame(this.animationHandle);
    }

    public render() {
        return (
            <div className={style.container}>
                <canvas ref={this.bindCanvasElement}/>
            </div>
        );
    }

    private modifyScale(delta: number) {
        let scale = this.scale + delta;
        if (scale < 0.35) {
            scale = 0.35;
        } else if (scale > 5) {
            scale = 5;
        }
        this.scale = scale;
    }

    private bindCanvasElement(canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement;

        this.canvasElement.width = window.innerWidth;
        this.canvasElement.height = window.innerHeight - 20; // fix
        this.offsetX = this.canvasElement.width / 2;
        this.offsetY = this.canvasElement.height / 2;

        this.canvasElement.addEventListener("wheel", (event) => {
            this.modifyScale(-event.deltaY / 10);
        }, true);

        this.ctx = this.canvasElement.getContext("2d");
        this.draw();
    }

    private draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        this.props.game.draw(this.ctx);
        this.ctx.restore();

        this.animationHandle = window.requestAnimationFrame(() => this.draw());
    }
}
