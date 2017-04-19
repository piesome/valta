import * as React from "react";

import {Game} from "../../Common/Game";
import * as RPC from "../../Common/RPC";
import {Types} from "../../Common/Types";

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
    }

    public componentWillMount() {
        this.setState({lobbyIds: []});
        this.updateLobbies();

        this.props.peer.on(RPC.LobbyUpdate.name, (data: RPC.LobbyUpdate.Params) => {
            this.setState({lobby: data});
        });

        this.props.peer.on(RPC.GameStarted.name, (data: RPC.GameStarted.Params) => {
            this.setState({
                game: new Game(this.props.types),
            });

            this.state.game.deserialize(data.gameState);
        });

        this.props.peer.on(RPC.GameUpdate.name, (data: RPC.GameUpdate.Params) => {
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
            return (<Lobby
                factionTypes={this.props.types.faction.possible()}
                lobby={this.state.lobby}
                ourId={this.props.peer.id}
                onLeave={() => this.leaveLobby()}
                onSelectFaction={(f: string) => this.selectFaction(f)}
                onStartGame={() => this.startGame()}
            />);
        }
        if (this.state.lobbyIds !== undefined) {
            return (<LobbyList
                lobbyIds={this.state.lobbyIds}
                onJoinLobby={(id: string) => this.joinLobby(id)}
                onCreateLobby={() => this.createLobby()}
            />);
        }
    }

    private async updateLobbies() {
        const peer = this.props.peer;

        const data = await peer.callPeer<RPC.ListLobbies.Response>(peer.server, RPC.ListLobbies.name, {});
        this.setState({
            lobbyIds: data.lobbyIds,
        });
    }

    private async createLobby() {
        const peer = this.props.peer;

        const data = await peer.callPeer<RPC.CreateLobby.Response>(peer.server, RPC.CreateLobby.name, {});

        this.setState({
            lobby: {
                id: data.id,
            },
        });
    }

    private async leaveLobby() {
        const peer = this.props.peer;

        await peer.callPeer<RPC.LeaveLobby.Response>(peer.server, RPC.LeaveLobby.name, {});

        this.setState({
            lobby: null,
        });
    }

    private async joinLobby(id: string) {
        const peer = this.props.peer;

        await peer.callPeer<RPC.JoinLobby.Response>(peer.server, RPC.JoinLobby.name, {id});

        this.setState({
            lobby: {
                id,
            },
        });
    }

    private async startGame() {
        const peer = this.props.peer;

        await peer.callPeer<RPC.StartGame.Response>(peer.server, RPC.StartGame.name, {});

        this.setState({lobby: null});
    }

    private selectFaction(factionType: string) {
        const peer = this.props.peer;

        peer.callPeer<RPC.SelectFaction.Response>(peer.server, RPC.SelectFaction.name, {
            factionType,
        });
    }
}
