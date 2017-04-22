import * as R from "ramda";
import "reflect-metadata";

import {Game} from "Common/Game";
import * as RPC from "Common/RPC";
import {TerrainGenerator} from "Common/TerrainGenerator";
import {Types} from "Common/Types";

import {Lobby} from "./Lobby";
import {RemotePeer} from "./RemotePeer";
import {ServerGame} from "./ServerGame";

const RPC_METADATA_KEY = "rpc";

interface IRPC {
    method: string;
    fn: (client: RemotePeer, data: any) => any;
}

function rpc(method: string) {
    return (target: any, propertyName: string, descriptor: any) => {
        const rpcs: IRPC[] = Reflect.getMetadata(RPC_METADATA_KEY, target) || [];
        rpcs.push({
            method,
            fn: target[propertyName],
        });
        Reflect.defineMetadata(RPC_METADATA_KEY, rpcs, target);

        return descriptor;
    };
}

export class GameManager {
    private lobbies: {[id: string]: Lobby};
    private games: {[id: string]: ServerGame};
    private types: Types;
    private peer: RPC.Peer<RemotePeer>;

    constructor() {
        this.games = {};
        this.lobbies = {};

        this.types = new Types();
    }

    public async load() {
        try {
            await this.types.load();
        } catch (err) {
            throw err;
        }
    }

    public register(peer: RPC.Peer<RemotePeer>) {
        this.peer = peer;

        const rpcs: IRPC[] = Reflect.getMetadata(RPC_METADATA_KEY, this) || [];
        for (const rpc of rpcs) {
            peer.register(rpc.method, rpc.fn.bind(this));
        }
    }

    private getGame(gameid: string): ServerGame {
        const game = this.games[gameid];

        if (!game) {
            throw new Error("No such game");
        }

        return game;
    }

    private getLobby(id: string): Lobby {
        const lobby = this.lobbies[id];
        if (!lobby) {
            throw new Error("No such lobby");
        }

        return lobby;
    }

    @rpc(RPC.ServerMethods.ListLobbies)
    private listLobbies(
        client: RemotePeer,
        params: RPC.ServerMethods.IListLobbiesParams,
    ): RPC.ServerMethods.IListLobbiesResponse {
        return {
            lobbyIds: Object.keys(this.lobbies),
        };
    }

    @rpc(RPC.ServerMethods.CreateLobby)
    private createLobby(
        client: RemotePeer,
        params: RPC.ServerMethods.ICreateLobbyParams,
    ): RPC.ServerMethods.ICreateLobbyResponse {
        const lobby = new Lobby();
        this.lobbies[lobby.id] = lobby;

        lobby.on("update", () => {
            const data = lobby.serialize();
            lobby.peers.map((peer) => peer.lobbyUpdate(data));
        });

        lobby.on("canBeRemoved", () => {
            delete this.lobbies[lobby.id];
        });

        client.join(lobby);

        return {
            id: lobby.id,
        };
    }

    @rpc(RPC.ServerMethods.JoinLobby)
    private joinLobby(
        client: RemotePeer,
        params: RPC.ServerMethods.IJoinLobbyParams,
    ): RPC.ServerMethods.IJoinLobbyResponse {
        const lobby = this.getLobby(params.id);
        client.join(lobby);
    }

    @rpc(RPC.ServerMethods.SelectFaction)
    private selectFaction(
        client: RemotePeer, params: RPC.ServerMethods.ISelectFactionParams,
    ): RPC.ServerMethods.ISelectFactionResponse {
        // check that params.factionType is valid
        this.types.faction.getType(params.factionType);
        client.factionType = params.factionType;
    }

    @rpc(RPC.ServerMethods.LeaveLobby)
    private leaveLobby(
        client: RemotePeer,
        params: RPC.ServerMethods.ILeaveLobbyParams,
    ): RPC.ServerMethods.ILeaveLobbyResponse {
        client.assertLobby();
        client.leave();
    }

    @rpc(RPC.ServerMethods.StartGame)
    private startGame(
        client: RemotePeer,
        params: RPC.ServerMethods.IStartGameParams,
    ): RPC.ServerMethods.IStartGameResponse {
        const lobby = client.lobby;

        if (!lobby.canBeStarted()) {
            throw new Error("Not all players have selected their faction yet");
        }

        const game = new ServerGame(this.types);
        (new TerrainGenerator(game, 3)).generate();

        R.map((x) => x.join(game), lobby.peers);

        game.on("update", () => {
            const gameState = game.serialize();
            game.peers.map((peer) => peer.gameUpdate(gameState));
        });

        game.endTurn();

        delete this.lobbies[lobby.id];

        const gameState = game.serialize();
        R.map((x) => x.gameStarted({
            faction: x.faction.serialize(),
        }), game.peers);
    }

    @rpc(RPC.ServerMethods.GetGameState)
    private getGameState(
        client: RemotePeer,
        params: RPC.ServerMethods.IGetGameStateParams,
    ): RPC.ServerMethods.IGetGameStateResponse {
        return client.game.serialize();
    }

    @rpc(RPC.ServerMethods.JoinGame)
    private joinGame(
        client: RemotePeer,
        params: RPC.ServerMethods.IJoinGameParams,
    ): RPC.ServerMethods.IJoinGameResponse {
        const game = this.getGame(params.id);
        client.join(game);
    }

    @rpc(RPC.ServerMethods.EndTurn)
    private endTurn(
        client: RemotePeer,
        params: RPC.ServerMethods.IEndTurnParams,
    ): RPC.ServerMethods.IEndTurnResponse {
        client.endTurn();
    }
}
