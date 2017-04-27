import * as React from "react";

import {Game} from "Common/Game";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Client} from "../Client";
import {ClientGame} from "../ClientGame";
import {GameInLobby} from "./GameInLobby";
import {GameInProgress} from "./GameInProgress";

export interface IGameProps {
    client: Client;
    types: Types;
    switchToGameList: () => void;
}

export interface IGameState {
    game: ClientGame;
}

export class GameComponent extends React.Component<IGameProps, IGameState> {
    constructor(props: IGameProps) {
        super(props);
    }

    public componentWillMount() {
        this.setState({game: new ClientGame(this.props.types)});

        this.props.client.on(RPC.ClientMethods.GameUpdate, (data: RPC.ClientMethods.IGameUpdateParams) => {
            this.state.game.deserialize(data);
            this.forceUpdate();
        });
    }

    public componentWillUnmount() {
        this.props.client.removeListener(RPC.ClientMethods.GameUpdate);
    }

    public render() {
        if (this.state.game.status === "lobby") {
            return (
                <GameInLobby
                    client={this.props.client}
                    types={this.props.types}
                    game={this.state.game}
                    switchToGameList={this.props.switchToGameList}
                />
            );
        } else if (this.state.game.status === "started") {
            return (
                <GameInProgress
                    client={this.props.client}
                    types={this.props.types}
                    game={this.state.game}
                    switchToGameList={this.props.switchToGameList}
                />
            );
        }
    }
}
