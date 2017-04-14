import * as WS from "ws";
import {v4 as uuid} from "uuid";

import {Game} from "valta.common/dist/Game";
import {
    FactionTypeManager,
    UnitTypeManager,
    TerrainTypeManager
} from "valta.common/dist/Types";
import {
    RPCPeer,
    RemoteRPCPeer,
    CreateGame,
    GetGameState
} from "valta.common/dist/RPC";
import {TerrainGenerator} from "valta.common/dist/TerrainGenerator";


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

    private factionTypes: FactionTypeManager;
    private terrainTypes: TerrainTypeManager;
    private unitTypes: UnitTypeManager;

    constructor() {
        this.games = {};

        this.factionTypes = new FactionTypeManager();
        this.terrainTypes = new TerrainTypeManager();
        this.unitTypes = new UnitTypeManager();
    }

    async load() {
        try {
            await this.factionTypes.load();
            await this.terrainTypes.load();
            await this.unitTypes.load();
        } catch (err) {
            throw err;
        }
    }

    createGame(client: string, params: CreateGame.Params): CreateGame.Response {
        const game = new Game(
            this.factionTypes,
            this.terrainTypes,
            this.unitTypes
        );

        const gen = new TerrainGenerator(game, 3);
        gen.generate();

        const id = uuid();
        this.games[id] = game;

        return {
            game: id
        };
    }

    getGameState(client: string, params: GetGameState.Params): GetGameState.Response {
        const game = this.games[params.game];

        if (!game) {
            throw new Error("No such game");
        }

        return {
            gameState: game.serialize()
        };
    }

    register(peer: RPCPeer) {
        peer.register<CreateGame.Params, CreateGame.Response>(
            CreateGame.name,
            (client, data) => this.createGame(client, data)
        );

        peer.register<GetGameState.Params, GetGameState.Response>(
            GetGameState.name,
            (client, data) => this.getGameState(client, data)
        );
    }
}

const server = new Server();
const gameManager = new GameManager();
gameManager.register(server);

gameManager.load()
    .then(() => {
        console.log("GameManager loaded")
    }, (err) => {
        console.error(err);
        process.exit(1);
    });
