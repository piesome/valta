import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Client} from "../../Client";
import {Controls} from "../Common/Controls";
import {FactionCube} from "../Common/FactionCube";
import {Table} from "../Common/Table";

export interface IGameInLobbyProps {
    client: Client;
    types: Types;
    game: Game;
    switchToGameList: () => void;
}

export class GameInLobby extends React.Component<IGameInLobbyProps, void> {
    constructor(props: IGameInLobbyProps) {
        super(props);

        this.leaveGame = this.leaveGame.bind(this);
        this.selectFaction = this.selectFaction.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    public render() {
        const factionTypeSelection = (fact: Faction) => {
            const options = R.map(
                (p) => <option key={p}>{p}</option>,
                R.concat(this.props.types.faction.possible(), ["undecided"]));
            return (
                <select value={fact.type.name} onChange={this.selectFaction}>
                    {options}
                </select>
            );
        };
        const renderFaction = (fact: Faction) => {
            const isUs = this.props.client.id === fact.id;
            return (
                <tr key={fact.id}>
                    <td><FactionCube order={fact.order} /></td>
                    <td><code>{fact.id}</code></td>
                    <td>{isUs ? factionTypeSelection(fact) : fact.type.name}</td>
                </tr>
            );
        };
        const factions = R.map((fact) => renderFaction(fact), this.props.game.factions);

        return (
            <div>
                <Controls>
                    <button onClick={this.leaveGame}>Leave game</button>
                    {this.props.game.canBeStarted() ? <button onClick={this.startGame}>Start game</button> : null}
                </Controls>

                <Table>
                    <thead>
                        <tr>
                            <th />
                            <th>Client ID</th>
                            <th>Faction type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {factions}
                    </tbody>
                </Table>
            </div>
        );
    }

    private leaveGame() {
        this.props.client.gameServer.close();
        this.props.switchToGameList();
    }

    private selectFaction(ev: React.ChangeEvent<any>) {
        this.props.client.gameServer.selectFaction({
            factionType: ev.target.value,
        });
    }

    private startGame() {
        this.props.client.gameServer.startGame();
    }
}