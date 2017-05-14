import * as PIXI from "pixi.js";
import * as R from "ramda";
import * as React from "react";

import {Action} from "Common/Actions";
import {Game} from "Common/Game";
import {City, Faction, TerrainSegment, Unit} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";
import {getHSL, Hex} from "Common/Util";

import {Camera, ICameraEvent} from "../../Camera";
import {Client} from "../../Client";
import {ClientGame} from "../../ClientGame";
import {IGameTime} from "../../GameTime";

import {Controls} from "../Common/Controls";
import {EditableField} from "../Common/EditableField";
import {FactionCube} from "../Common/FactionCube";

import {EndTurnHud} from "./EndTurnHud";
import {FactionHud} from "./FactionHud";
import {SelectHud} from "./SelectHud";

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
    private app: PIXI.Application;
    private camera: Camera;
    private hover: Hex;
    private hoverContainer: PIXI.Container;

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
        this.app.destroy(false);
    }

    public render() {
        return (
            <div className={style.game}>
                <Controls>
                    <span style={{float: "right"}}>
                        Tick: {this.props.game.tick}
                    </span>
                </Controls>
                <div className={style.container}>
                    <canvas ref={this.bindCanvasElement} />
                    <FactionHud game={this.props.game} ourId={this.props.client.id} />
                    <EndTurnHud game={this.props.game} ourId={this.props.client.id} endTurn={this.endTurn} />
                    <SelectHud>
                        {this.renderAction()}
                        {this.renderSelectedCity()}
                        {this.renderSelectedUnit()}
                    </SelectHud>
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
        const ours = city.faction.id === this.props.client.id;

        const info = ours ? (
            <table className={style.info}>
                <tbody>
                    <tr>
                        <td>food</td>
                        <td>{city.resources.food}</td>
                    </tr>
                    <tr>
                        <td>production</td>
                        <td>{city.resources.production}</td>
                    </tr>
                </tbody>
            </table>
        ) : null;

        const unlockedTypes = this.props.types.unit.unlockedFor(city.faction);

        const produce = (unitType: string) => {
            return (() => {
                this.props.client.gameServer.pushProductionQueue({
                    city: city.id,
                    unitType,
                });
            });
        };

        const queueButtons = ours && city.faction.canAct ? (
            <div>
                <div><strong>Add to production queue</strong></div>
                {unlockedTypes.map((type) => <button key={type.name} onClick={produce(type.name)}>{type.name}</button>)}
            </div>
        ) : null;

        const productionQueue = ours ? (
            <div>
                <div><strong>Production queue</strong></div>
                <table className={style.info}>
                    <tbody>
                        <tr>
                            <td>food</td>
                            <td>
                                {city.productionQueue.contributedCost.food}
                                &nbsp;/ {city.productionQueue.totalResources().food}
                            </td>
                        </tr>
                        <tr>
                            <td>production</td>
                            <td>
                                {city.productionQueue.contributedCost.production}
                                &nbsp;/ {city.productionQueue.totalResources().production}
                            </td>
                        </tr>
                    </tbody>
                </table>
                {city.productionQueue.queue.map((type, ind) => <div key={ind}>{ind + 1}. {type.name}</div>)}
            </div>
        ) : null;

        const saveCityName = async (name: string) => {
            try {
                await this.props.client.gameServer.renameCity({
                    id: city.id,
                    name,
                });
            } catch (err) {
                throw err;
            }
        };

        return (
            <div className={style.snippet}>
                <div>
                    <FactionCube order={city.faction.order} />
                </div>
                <EditableField
                    value={city.name}
                    enabled={ours && city.faction.canAct}
                    edited={saveCityName}
                />
                {info}
                {queueButtons}
                {productionQueue}
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

        this.app = new PIXI.Application(
            this.canvasElement.width,
            this.canvasElement.height,
            {view: this.canvasElement, backgroundColor: 0x2b2b2b},
        );

        this.hoverContainer = new PIXI.Container();

        this.camera.on("update", () => {
            this.app.stage.scale.x = this.camera.zoomLevel;
            this.app.stage.scale.y = this.camera.zoomLevel;
            this.app.stage.position.x = this.camera.panX;
            this.app.stage.position.y = this.camera.panY;
        });

        this.populateStage();
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
            this.hoverContainer.removeChildren();
            this.props.game.drawHover(this.hoverContainer, this.hover);
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
                    return;
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

            this.populateStage();
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

    private populateStage() {
        this.app.stage.removeChildren();

        this.props.game.drawTerrain(this.app.stage);
        this.props.game.drawOutlines(this.app.stage);

        this.app.stage.addChild(this.hoverContainer);

        this.props.game.drawUnits(this.app.stage);
    }
}
