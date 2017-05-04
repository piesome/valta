import * as R from "ramda";
import * as React from "react";

import {Action} from "Common/Actions";
import {Game} from "Common/Game";
import {City, Faction, TerrainSegment, Unit} from "Common/Models";
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
    selectedCity: City;
    inAction: Action<any>;
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
        this.endTurn = this.endTurn.bind(this);
        this.cancelAction = this.cancelAction.bind(this);
    }

    public componentWillMount() {
        this.setState({selectedUnit: null, inAction: null, selectedCity: null});
    }

    public componentWillUnmount() {
        window.cancelAnimationFrame(this.animationHandle);
    }

    public render() {
        return (
            <div className={style.game}>
                <Controls />
                <div className={style.container}>
                    <div className={style.sidebar}>
                        {this.renderInfo()}
                        {this.renderSelectedCity()}
                        {this.renderSelectedUnit()}
                        {this.renderAction()}
                    </div>
                    <div className={style.canvas}>
                        <canvas ref={this.bindCanvasElement}/>
                    </div>
                </div>
            </div>
        );
    }

    private renderInfo() {
        const faction = this.props.game.getFaction(this.props.client.id);

        return (
            <div className={style.snippet}>
                <table className={style.info}>
                    <tbody>
                        <tr>
                            <td>Tick</td>
                            <td>{this.props.game.tick}</td>
                        </tr>
                        <tr>
                            <td>Faction</td>
                            <td><FactionCube order={faction.order} /></td>
                        </tr>
                        <tr>
                            <td>Can act</td>
                            <td>{faction.canAct ? "yes" : "no"}</td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    {faction.canAct ? <button onClick={this.endTurn}>End turn</button> : null}
                </div>
            </div>
        );
    }

    private endTurn() {
        this.props.client.gameServer.endTurn();
    }

    private renderSelectedCity() {
        if (!this.state || !this.state.selectedCity) {
            return null;
        }

        const city = this.state.selectedCity;

        return (
            <div className={style.snippet}>
                <div>{city.name}</div>
            </div>
        );
    }

    private selectAction(act: string) {
        return () => {
            const action = this.props.game.actionManager.getAction(act);
            const actor = this.getActor();
            this.setState({inAction: action});

            if (action && actor && action.range(actor) === 0) {
                this.doAction(action, actor, actor.terrain);
            }
        };
    }

    private renderSelectedUnit() {
        if (!this.state || !this.state.selectedUnit) {
            return null;
        }

        const unit = this.state.selectedUnit;
        const ours = unit.faction.id === this.props.client.id;
        const possibleActions = unit.type.actions.map((act) => {
            return (
                <button key={act} onClick={this.selectAction(act)}>{act}</button>
            );
        });
        const actions = ours && unit.faction.canAct && unit.currentEnergy > 0 ? <div>{possibleActions}</div> : null;

        const energy = ours ? <tr><td>energy</td><td>{unit.currentEnergy} / {unit.maximumEnergy}</td></tr> : null;

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
                            <td>damage</td>
                            <td>{unit.damage}</td>
                        </tr>
                        {energy}
                    </tbody>
                </table>
                {actions}
            </div>
        );
    }

    private renderAction() {
        if (!this.state || !this.state.inAction) {
            return null;
        }

        return (
            <div className={style.snippet}>
                <table className={style.info}>
                    <tbody>
                        <tr>
                            <td>action</td>
                            <td>{this.state.inAction.name}</td>
                        </tr>
                        <tr>
                            <td>range</td>
                            <td>{this.state.inAction.range(this.state.selectedUnit)}</td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={this.cancelAction}>Cancel</button>
            </div>
        );
    }

    private cancelAction() {
        this.setState({
            inAction: null,
        });
    }

    private bindCanvasElement(canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement;
        this.recalculateSize();
        this.bindEvents();

        this.ctx = this.canvasElement.getContext("2d");
        this.draw();
    }

    private getActor() {
        return this.state.selectedCity || this.state.selectedUnit;
    }

    private async doAction(action: Action<any>, actor: Unit|City, target: TerrainSegment) {
        try {
            await this.props.client.gameServer.action(action.serialize(actor, target));
        } catch (err) {
            console.error(err);
            throw err;
        }

        this.setState({
            inAction: null,
        });
    }

    private bindEvents() {
        this.camera.bindTo(this.canvasElement);

        window.addEventListener("resize", (event) => {
            this.recalculateSize();
        });

        this.camera.on("hover", (event: ICameraEvent) => {
            this.hover = event.hex;
        });

        this.camera.on("select", async (event: ICameraEvent) => {
            const hex = event.hex;

            if (!(hex.r in this.props.game.terrain && hex.q in this.props.game.terrain[hex.r])) {
                return;
            }

            const terrain = this.props.game.terrain[hex.r][hex.q];

            if (this.state.inAction && this.getActor()) {
                try {
                    await this.doAction(this.state.inAction, this.getActor(), terrain);
                } catch (err) {
                    return;
                }
            }

            this.setState({inAction: null});

            const selectables = R.filter(R.identity, R.append(terrain.city, terrain.units));

            if (selectables.length === 0) {
                return this.setState({
                    selectedCity: null,
                    selectedUnit: null,
                });
            }

            // todo: make clearer
            const select = (selectable: any): void => {
                if (selectable.name !== undefined) {
                    this.setState({
                        selectedCity: (selectable as City),
                        selectedUnit: null,
                    });
                } else {
                    this.setState({
                        selectedCity: null,
                        selectedUnit: (selectable as Unit),
                    });
                }
            };

            const currentlySelected = this.state.selectedCity || this.state.selectedUnit || null;
            if (!currentlySelected) {
                return select(selectables[0]);
            }

            const ind = R.indexOf(currentlySelected.id, R.map((s: any) => s.id, selectables));
            if (ind === -1 || ind === selectables.length - 1) {
                return select(selectables[0]);
            }

            select(selectables[ind + 1]);
        });

        this.props.game.on("deserialized", () => {
            if (!this.state) {
                return;
            }

            if (this.state.selectedUnit) {
                const id = this.state.selectedUnit.id;
                try {
                    this.setState({selectedUnit: this.props.game.getUnit(id)});
                } catch (err) {
                    this.setState({selectedUnit: null});
                }
            }

            if (this.state.selectedCity) {
                const id = this.state.selectedCity.id;
                this.setState({selectedCity: this.props.game.cities[id]});
            }
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
