import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction, Unit} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";
import {Hex} from "Common/Util";

import {Camera, ICameraEvent} from "../Camera";
import {Client} from "../Client";
import {ClientGame} from "../ClientGame";
import {IGameTime} from "../GameTime";
import {Controls} from "./Controls";
import {FactionCube} from "./FactionCube";

const style = require("./GameInProgress.scss");

export interface IGameInProgressProps {
    client: Client;
    types: Types;
    game: ClientGame;
    switchToGameList: () => void;
}

export interface IGameInProgressState {
    selectedUnit: Unit;
}

export class GameInProgress extends React.Component<IGameInProgressProps, IGameInProgressState> {
    private canvasElement: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationHandle: number;
    private camera: Camera;
    private hover: Hex;

    constructor(props: IGameInProgressProps) {
        super(props);

        this.camera = new Camera();

        this.bindCanvasElement = this.bindCanvasElement.bind(this);
    }

    public componentWillUnmount() {
        this.setState({selectedUnit: null});
        window.cancelAnimationFrame(this.animationHandle);
    }

    public render() {
        return (
            <div className={style.game}>
                <Controls>
                    <button>Quit</button>
                </Controls>
                <div className={style.container}>
                    <div className={style.sidebar}>
                        {this.renderSelectedUnit()}
                    </div>
                    <div className={style.canvas}>
                        <canvas ref={this.bindCanvasElement}/>
                    </div>
                </div>
            </div>
        );
    }

    private renderSelectedUnit() {
        if (!this.state || !this.state.selectedUnit) {
            return null;
        }

        const unit = this.state.selectedUnit;
        const ours = unit.faction.id === this.props.client.id;
        const possibleActions = unit.type.actions.map((act) => <button key={act}>{act}</button>);
        const actions = ours ? <div>{possibleActions}</div> : null;

        return (
            <div className={style.snippet}>
                <div>
                    <FactionCube order={unit.faction.order} />
                    &nbsp;
                    {unit.type.name}
                </div>
                <table className={style.info}>
                    <tbody>
                        <tr>
                            <td>health</td>
                            <td>{unit.currentHealth} / {unit.maximumHealth}</td>
                        </tr>
                        <tr>
                            <td>energy</td>
                            <td>{unit.currentEnergy} / {unit.maximumEnergy}</td>
                        </tr>
                    </tbody>
                </table>
                {actions}
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

        window.addEventListener("resize", (event) => {
            this.recalculateSize();
        });

        this.camera.on("hover", (event: ICameraEvent) => {
            this.hover = event.hex;
        });

        this.camera.on("select", (event: ICameraEvent) => {
            const hex = event.hex;

            if (!(hex.r in this.props.game.terrain && hex.q in this.props.game.terrain[hex.r])) {
                return;
            }

            const terrain = this.props.game.terrain[hex.r][hex.q];

            this.setState({
                selectedUnit: terrain.units[0] || null,
            });
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
