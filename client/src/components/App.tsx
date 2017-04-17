import * as React from "react";

import * as RPC from "valta.common/src/RPC";
import {Types} from "valta.common/src/Types";
import {Game} from "valta.common/src/Game";

import {Peer} from "../Peer";
import {Lobby} from "./Lobby";
import {LobbyList} from "./LobbyList";

export interface AppProps {
    peer: Peer;
    types: Types;
}

export interface AppState {
    lobbyIds: string[];
    lobby: {
        id: string;
        name?: string;
        canBeStarted?: boolean;
        peers?: {
            id: string,
            factionType: string
        }[]
    };
    game: Game;
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
    }

    componentWillMount() {
        this.setState({lobbyIds: []});
        this.updateLobbies();

        this.props.peer.on(RPC.LobbyUpdate.name, (data: RPC.LobbyUpdate.Params) => {
            this.setState({lobby: data});
        });

        this.props.peer.on(RPC.GameStarted.name, (data: RPC.GameStarted.Params) => {
            this.setState({
                game: new Game(this.props.types)
            });

            this.state.game.deserialize(data.gameState);
        });

        this.props.peer.on(RPC.GameUpdate.name, (data: RPC.GameUpdate.Params) => {
            this.state.game.deserialize(data);
        });
    }

    async updateLobbies() {
        const peer = this.props.peer;

        const data = await peer.callPeer<RPC.ListLobbies.Response>(peer.server, RPC.ListLobbies.name, {});
        this.setState({
            lobbyIds: data.lobbyIds
        });
    }

    async createLobby() {
        const peer = this.props.peer;

        const data = await peer.callPeer<RPC.CreateLobby.Response>(peer.server, RPC.CreateLobby.name, {});

        this.setState({
            lobby: {
                id: data.id
            }
        });
    }

    async leaveLobby() {
        const peer = this.props.peer;

        await peer.callPeer<RPC.LeaveLobby.Response>(peer.server, RPC.LeaveLobby.name, {});

        this.setState({
            lobby: null
        });
    }

    async joinLobby(id: string) {
        const peer = this.props.peer;

        await peer.callPeer<RPC.JoinLobby.Response>(peer.server, RPC.JoinLobby.name, {id});

        this.setState({
            lobby: {
                id: id
            }
        });
    }

    async startGame() {
        const peer = this.props.peer;

        await peer.callPeer<RPC.StartGame.Response>(peer.server, RPC.StartGame.name, {});

        this.setState({lobby: null});
    }

    selectFaction(factionType: string) {
        const peer = this.props.peer;

        peer.callPeer<RPC.SelectFaction.Response>(peer.server, RPC.SelectFaction.name, {
            factionType
        });
    }

    render() {
        if (this.state.game) {
            return (
                <strong>TODO: game</strong>
            );
        }
        if (this.state.lobby) {
            return <Lobby
                factionTypes={this.props.types.faction.possible()}
                lobby={this.state.lobby}
                ourId={this.props.peer.id}
                onLeave={() => this.leaveLobby()}
                onSelectFaction={(f: string) => this.selectFaction(f)}
                onStartGame={() => this.startGame()}
            />;
        }
        if (this.state.lobbyIds !== undefined) {
            return <LobbyList
                lobbyIds={this.state.lobbyIds}
                onJoinLobby={(id: string) => this.joinLobby(id)}
                onCreateLobby={() => this.createLobby()}
            />;
        }
    }
}
