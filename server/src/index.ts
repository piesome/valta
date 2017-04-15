import * as WS from "ws";
import {v4 as uuid} from "uuid";

import {Game} from "valta.common/src/Game";
import {Types} from "valta.common/src/Types";
import {
    RPCPeer,
    RemoteRPCPeer,
    ListGames,
    CreateGame,
    GetGameState,
    JoinGame
} from "valta.common/src/RPC";
import {TerrainGenerator} from "valta.common/src/TerrainGenerator";


class RemotePeer extends RemoteRPCPeer {
    public ws: WS;

    constructor(id: string, ws: WS) {
        super(id);
        this.ws = ws;
    }
}

class Server extends RPCPeer {
    private wss: WS.Server;

    constructor() {
        super(uuid());

        this.wss = new WS.Server({
            perMessageDeflate: false,
            port: 3001
        });

        this.wss.on("connection", x => this.onConnection(x));
    }

    send(peer: RemotePeer, data: any) {
        data.jsonrpc = "2.0";
        const json = JSON.stringify(data);
        peer.ws.send(json);
    }

    private onConnection(ws: WS) {
        const id = uuid();
        const peer = new RemotePeer(id, ws);
        this.addPeer(peer);

        ws.on("close", () => this.removePeer(peer));
        ws.on("message", (data) => {
            try {
                const json = JSON.parse(data);
                this.onMessage(peer, json);
            } catch (e) {}
        });
    }
}

class GameManager {
    private games: {[id: string]: Game};

    private types: Types;

    constructor() {
        this.games = {};

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

    listGames(client: string, params: ListGames.Params): ListGames.Response {
        return {
            games: Object.keys(this.games)
        };
    }

    createGame(client: string, params: CreateGame.Params): CreateGame.Response {
        const game = new Game(
            this.types
        );

        const gen = new TerrainGenerator(game, 3);
        gen.generate();

        const id = uuid();
        this.games[id] = game;

        return {
            game: id
        };
    }

    joinGame(client: string, params: JoinGame.Params): JoinGame.Response {
        const game = this.getGame(params.game);

        const faction = game.createFaction(params.factionType);

        return {
            faction: faction.id
        };
    }

    getGameState(client: string, params: GetGameState.Params): GetGameState.Response {
        const game = this.getGame(params.game);

        return {
            gameState: game.serialize()
        };
    }

    register(peer: RPCPeer) {
        peer.register<ListGames.Params, ListGames.Response>(
            ListGames.name,
            (client, data) => this.listGames(client, data)
        );

        peer.register<CreateGame.Params, CreateGame.Response>(
            CreateGame.name,
            (client, data) => this.createGame(client, data)
        );

        peer.register<GetGameState.Params, GetGameState.Response>(
            GetGameState.name,
            (client, data) => this.getGameState(client, data)
        );

        peer.register<JoinGame.Params, JoinGame.Response>(
            JoinGame.name,
            (client, data) => this.joinGame(client, data)
        );
    }
}

const server = new Server();
const gameManager = new GameManager();
gameManager.register(server);

gameManager.load()
    .then(() => {
        console.log("GameManager: loaded");
    }, (err) => {
        console.error(err);
        process.exit(1);
    });
