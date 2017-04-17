import * as RPC from "valta.common/src/RPC";
import {Game} from "valta.common/src/Game";
import {Types} from "valta.common/src/Types";

import {RemotePeer} from "./RemotePeer";
import {Lobby} from "./Lobby";


export class GameManager {
    private lobbies: {[id: string]: Lobby};
    private games: {[id: string]: Game};
    private types: Types;
    private peer: RPC.Peer<RemotePeer>;

    constructor() {
        this.games = {};
        this.lobbies = {};

        this.types = new Types();
    }

    async load() {
        try {
            await this.types.load();
        } catch (err) {
            throw err;
        }
    }

    getGame(gameid: string): Game {
        const game = this.games[gameid];

        if (!game) {
            throw new Error("No such game");
        }

        return game;
    }

    getLobby(id: string): Lobby {
        const lobby = this.lobbies[id];
        if (!lobby) {
            throw new Error("No such lobby");
        }

        return lobby;
    }

    listLobbies(client: RemotePeer, params: RPC.ListLobbies.Params): RPC.ListLobbies.Response {
        return {
            lobbies: Object.keys(this.lobbies)
        };
    }

    createLobby(client: RemotePeer, params: RPC.CreateLobby.Params): RPC.CreateLobby.Response {
        client.assertNotInLobby();

        const lobby = new Lobby();
        this.lobbies[lobby.id] = lobby;

        lobby.on("update", () => {
            const data = lobby.serialize();
            lobby.peers.map(x => this.peer.notifyPeer(x, RPC.LobbyUpdate.name, data));
        });

        lobby.addPeer(client);

        return {
            lobby: lobby.id
        };
    }

    joinLobby(client: RemotePeer, params: RPC.JoinLobby.Params): RPC.JoinLobby.Response {
        client.assertNotInLobby();
        const lobby = this.getLobby(params.lobby);
        lobby.addPeer(client);

        return {
            lobby: lobby.id
        };
    }

    selectFaction(client: RemotePeer, params: RPC.SelectFaction.Params): RPC.SelectFaction.Response {
        // check that params.factionType is valid
        this.types.faction.getType(params.factionType);

        client.assertLobby();
        client.factionType = params.factionType;
        client.lobby.emit("update");

        return {};
    }

    leaveLobby(client: RemotePeer, params: RPC.LeaveLobby.Params): RPC.LeaveLobby.Response {
        client.assertLobby();
        const lobby = client.lobby;

        lobby.removePeer(client);

        if (lobby.canBeRemoved()) {
            delete this.lobbies[lobby.id];
        }

        return {};
    }

    startGame(client: RemotePeer, params: RPC.StartGame.Params): RPC.StartGame.Response {
        client.assertLobby();
        const lobby = client.lobby;

        if (!lobby.canBeStarted()) {
            throw new Error("Not all players have selected their faction yet");
        }

        const game = lobby.start(this.types);

        delete this.lobbies[lobby.id];

        game.on("update", () => {
            const data = game.serialize();
            game.clients.map(x => this.peer.notifyPeer(x, RPC.GameUpdate.name, data));
        });

        game.clients.map(x => this.peer.notifyPeer(x, RPC.GameStarted.name, x.faction.serialize()));

        return {};
    }

    getGameState(client: RemotePeer, params: RPC.GetGameState.Params): RPC.GetGameState.Response {
        client.assertGame();

        return {
            gameState: client.game.serialize()
        };
    }

    register(peer: RPC.Peer<RemotePeer>) {
        this.peer = peer;

        // lobby

        peer.register<RPC.ListLobbies.Params, RPC.ListLobbies.Response>(
            RPC.ListLobbies.name,
            (client, data) => this.listLobbies(client, data)
        );

        peer.register<RPC.CreateLobby.Params, RPC.CreateLobby.Response>(
            RPC.CreateLobby.name,
            (client, data) => this.createLobby(client, data)
        );

        peer.register<RPC.JoinLobby.Params, RPC.JoinLobby.Response>(
            RPC.JoinLobby.name,
            (client, data) => this.joinLobby(client, data)
        );

        peer.register<RPC.SelectFaction.Params, RPC.SelectFaction.Response>(
            RPC.SelectFaction.name,
            (client, data) => this.selectFaction(client, data)
        );

        peer.register<RPC.LeaveLobby.Params, RPC.LeaveLobby.Response>(
            RPC.LeaveLobby.name,
            (client, data) => this.leaveLobby(client, data)
        );

        // game

        peer.register<RPC.StartGame.Params, RPC.StartGame.Response>(
            RPC.StartGame.name,
            (client, data) => this.startGame(client, data)
        );

        peer.register<RPC.GetGameState.Params, RPC.GetGameState.Response>(
            RPC.GetGameState.name,
            (client, data) => this.getGameState(client, data)
        );
    }
}
