import * as url from "url";

import * as debug from "debug";
import * as jwt from "jsonwebtoken";
import * as Knex from "knex";
import {v4 as uuid} from "uuid";
import * as WS from "ws";

import * as RPC from "Common/RPC";
import {registerRPC, registerRPCs} from "Common/RPC";
import {Types} from "Common/Types";

import {GameClient} from "./GameClient";
import {IndexServer} from "./IndexServer";
import {ServerGame} from "./ServerGame";

export class GameServer extends RPC.Peer<GameClient> {
    private games: {[id: string]: ServerGame};
    private types: Types;

    private wss: WS.Server;
    private db: Knex;
    private index: IndexServer;
    private log: debug.IDebugger;

    constructor() {
        super();

        this.log = debug("valta:GameServer");

        this.wss = new WS.Server({
            perMessageDeflate: false,
            port: 30320,
        });

        this.games = {};
        this.types = new Types();
    }

    public async load() {
        registerRPCs(this);

        this.db = Knex(require("../../knexfile")[process.env.NODE_ENV]);
        this.index = new IndexServer(this.db, process.env.INDEX_URL);
        await this.index.connect();

        this.wss.on("connection", (x) => this.onConnection(x));

        return await this.types.load();
    }

    private onConnection(ws: WS) {
        let payload: any;
        try {
            const parsed = url.parse(ws.upgradeReq.url, true);
            const token = parsed.query.token;

            payload = jwt.verify(token, this.index.authenticatedSecret, {
                algorithms: ["HS512"],
                audience: this.index.authenticatedId,
            });
        } catch (e) {
            this.log(e);
            return ws.close();
        }

        const peer = new GameClient(payload.peer.id, ws);
        this.addPeer(peer);

        this.log(`New peer ${peer.id}`);

        if (!this.games[payload.game.id]) {
            this.createGame(payload.game.id);
        }

        peer.game = this.getGame(payload.game.id);
    }

    private createGame(gameId: string) {
        const game = this.games[gameId] = new ServerGame(gameId, this.types);
        game.name = "unnamed";

        this.log(`Game ${game.id} created`);

        game.on("canBeRemoved", () => {
            if (this.games[gameId]) {
                this.removeGame(gameId);
            }
        });

        game.on("update", () => {
            this.index.setGameStatus(game.serializeShort());
        });
    }

    private removeGame(gameId: string) {
        delete this.games[gameId];
        this.index.deleteGameStatus({id: gameId});
    }

    private getGame(gameid: string): ServerGame {
        const game = this.games[gameid];

        if (!game) {
            throw new Error("No such game");
        }

        return game;
    }

    @registerRPC(RPC.GameServerMethods.SelectFaction)
    private selectFaction(
        client: GameClient,
        params: RPC.GameServerMethods.ISelectFactionParams,
    ): RPC.GameServerMethods.ISelectFactionResponse {
        client.game.selectFactionType(client.id, params.factionType);
    }

    @registerRPC(RPC.GameServerMethods.StartGame)
    private startGame(
        client: GameClient,
        params: RPC.GameServerMethods.IStartGameParams,
    ): RPC.GameServerMethods.IStartGameResponse {
        client.game.startGame();
    }

    @registerRPC(RPC.GameServerMethods.GetGameState)
    private getGameState(
        client: GameClient,
        params: RPC.GameServerMethods.IGetGameStateParams,
    ): RPC.GameServerMethods.IGetGameStateResponse {
        return client.game.serialize();
    }

    @registerRPC(RPC.GameServerMethods.EndTurn)
    private endTurn(
        client: GameClient,
        params: RPC.GameServerMethods.IEndTurnParams,
    ): RPC.GameServerMethods.IEndTurnResponse {
        client.endTurn();
    }
}
