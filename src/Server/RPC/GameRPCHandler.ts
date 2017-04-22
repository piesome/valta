import * as R from "ramda";

import * as RPC from "Common/RPC";
import {TerrainGenerator} from "Common/TerrainGenerator";

import {ServerGame} from "../Models/ServerGame";
import {RemotePeer} from "../RemotePeer";
import {registerRPC, RPCHandler} from "./RPCHandler";

export class GameRPCHandler extends RPCHandler {
    private games: {[id: string]: ServerGame};

    constructor() {
        super();

        this.games = {};
    }

    private getGame(gameid: string): ServerGame {
        const game = this.games[gameid];

        if (!game) {
            throw new Error("No such game");
        }

        return game;
    }

    @registerRPC(RPC.ServerMethods.StartGame)
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

        R.map((x) => x.gameStarted({
            faction: x.faction.serialize(),
        }), game.peers);
    }

    @registerRPC(RPC.ServerMethods.GetGameState)
    private getGameState(
        client: RemotePeer,
        params: RPC.ServerMethods.IGetGameStateParams,
    ): RPC.ServerMethods.IGetGameStateResponse {
        return client.game.serialize();
    }

    @registerRPC(RPC.ServerMethods.JoinGame)
    private joinGame(
        client: RemotePeer,
        params: RPC.ServerMethods.IJoinGameParams,
    ): RPC.ServerMethods.IJoinGameResponse {
        const game = this.getGame(params.id);
        client.join(game);
    }

    @registerRPC(RPC.ServerMethods.EndTurn)
    private endTurn(
        client: RemotePeer,
        params: RPC.ServerMethods.IEndTurnParams,
    ): RPC.ServerMethods.IEndTurnResponse {
        client.endTurn();
    }
}
