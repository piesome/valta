import * as React from "react";

import {Game} from "Common/Game";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Peer} from "../Peer";
import {Lobby} from "./Lobby";
import {LobbyList} from "./LobbyList";

export interface IAppProps {
    peer: Peer;
    types: Types;
}

export interface IAppState {
    lobbyIds: string[];
    lobby: {
        id: string;
        name?: string;
        canBeStarted?: boolean;
        peers?: Array<{
            id: string,
            factionType: string,
        }>
    };
    game: Game;
}

export class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);

        // big thanks to react for making our code so nice....
        this.createLobby = this.createLobby.bind(this);
        this.joinLobby = this.joinLobby.bind(this);
        this.leaveLobby = this.leaveLobby.bind(this);
        this.selectFaction = this.selectFaction.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    public componentWillMount() {
        this.setState({lobbyIds: []});
        this.updateLobbies();

        this.props.peer.on(RPC.ClientMethods.LobbyUpdate, (data: RPC.ClientMethods.ILobbyUpdateParams) => {
            this.setState({lobby: data});
        });

        this.props.peer.on(RPC.ClientMethods.GameStarted, (data: RPC.ClientMethods.IGameStartedParams) => {
            this.setState({
                game: new Game(this.props.types),
            });

            this.state.game.deserialize(data.gameState);
        });

        this.props.peer.on(RPC.ClientMethods.GameUpdate, (data: RPC.ClientMethods.IGameUpdateParams) => {
            this.state.game.deserialize(data);
        });
    }

    public render() {
        if (this.state.game) {
            return (
                <strong>TODO: game</strong>
            );
        }
        if (this.state.lobby) {
            return (
                <Lobby
                    factionTypes={this.props.types.faction.possible()}
                    lobby={this.state.lobby}
                    ourId={this.props.peer.id}
                    onLeave={this.leaveLobby}
                    onSelectFaction={this.selectFaction}
                    onStartGame={this.startGame}
                />
            );
        }
        if (this.state.lobbyIds !== undefined) {
            return (
                <LobbyList
                    lobbyIds={this.state.lobbyIds}
                    onJoinLobby={this.joinLobby}
                    onCreateLobby={this.createLobby}
                />
            );
        }
    }

    private async updateLobbies() {
        const data = await this.props.peer.server.updateLobbies();
        this.setState({
            lobbyIds: data.lobbyIds,
        });
    }

    private async createLobby() {
        const data = await this.props.peer.server.createLobby();

        this.setState({
            lobby: {
                id: data.id,
            },
        });
    }

    private async leaveLobby() {
        await this.props.peer.server.leaveLobby();

        this.setState({
            lobby: null,
        });
    }

    private async joinLobby(id: string) {
        await this.props.peer.server.joinLobby({id});

        this.setState({
            lobby: {
                id,
            },
        });
    }

    private async startGame() {
        const peer = this.props.peer;

        await this.props.peer.server.startGame();

        this.setState({lobby: null});
    }

    private selectFaction(factionType: string) {
        const peer = this.props.peer;

        this.props.peer.server.selectFaction({factionType});
    }
}
