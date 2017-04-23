import * as React from "react";

import {Game} from "Common/Game";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Client} from "../Client";
import {GameList} from "./GameList";
import {Lobby} from "./Lobby";

export interface IAppProps {
    client: Client;
    types: Types;
}

export interface IAppState {
    games: Array<{
        id: string;
        name: string;
        factionCount: number;
        status: string;
    }>;
    game: Game;
}

export class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);

        // big thanks to react for making our code so nice....
        this.selectFaction = this.selectFaction.bind(this);
        this.startGame = this.startGame.bind(this);

        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
    }

    public componentWillMount() {
        this.setState({games: []});
        this.updateGames();

        this.props.client.on(RPC.ClientMethods.GameUpdate, (data: RPC.ClientMethods.IGameUpdateParams) => {
            if (!this.state.game) {
                this.setState({game: new Game(this.props.types)});
            }

            this.state.game.deserialize(data);
        });
    }

    public render() {
        if (this.state.game) {
            return (
                <strong>TODO: game</strong>
            );
        }
        if (!this.state.game) {
            return (
                <GameList
                    games={this.state.games}
                    createGame={this.createGame}
                    joinGame={this.joinGame}
                />
            );
        }
    }

    private async updateGames() {
        const data = await this.props.client.indexServer.listGames();
        this.setState({
            games: data.games,
        });
    }

    private async createGame() {
        const data = await this.props.client.indexServer.createGame();
        await this.props.client.connectToGame(data.url);
    }

    private async joinGame(id: string) {
        const data = await this.props.client.indexServer.joinGame(id);
        await this.props.client.connectToGame(data.url);
    }

    private async startGame() {
        const peer = this.props.client;

        await this.props.client.gameServer.startGame();
    }

    private selectFaction(factionType: string) {
        const peer = this.props.client;

        this.props.client.gameServer.selectFaction({factionType});
    }
}
