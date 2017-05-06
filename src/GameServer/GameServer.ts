import * as url from "url";

import * as debug from "debug";
import * as jwt from "jsonwebtoken";
import * as Knex from "knex";
import * as R from "ramda";
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

        await this.types.load();

        await this.loadGames();
    }

    private onConnection(ws: WS) {
        try {
            const parsed = url.parse(ws.upgradeReq.url, true);
            const token = parsed.query.token;

            const payload = jwt.verify(token, this.index.authenticatedSecret, {
                algorithms: ["HS512"],
                audience: this.index.authenticatedId,
            });

            if (payload.peer.id in this.peers) {
                this.peers[payload.peer.id].ws.close();
            }

            const peer = new GameClient(payload.peer.id, ws);
            this.addPeer(peer);

            this.log(`New peer ${peer.id}`);

            if (!this.games[payload.game.id]) {
                this.createGame(payload.game.id, payload.game.host);
            }

            const game = this.getGame(payload.game.id);

            if (game.status !== "lobby") {
                // This will throw if the peer doesn't belong in the game
                game.getFaction(peer.id);
            }

            peer.hi();

            peer.game = game;
        } catch (e) {
            this.log(e);
            return ws.close(3000, e.toString());
        }
    }

    private watchGame(game: ServerGame) {
        game.on("canBeRemoved", () => {
            if (this.games[game.id]) {
                this.removeGame(game.id);
            }
        });

        game.on("update", async () => {
            this.index.setGameStatus(game.serializeShort());
            if (game.status !== "lobby") {
                const serialized = JSON.stringify(game.serialize());

                const changed = await this.db
                    .table("game")
                    .update({
                        data: serialized,
                    })
                    .where("id", game.id);

                if (changed === 1) {
                    this.log(`Game ${game.id} updated`);
                    return;
                }

                await this.db
                    .table("game")
                    .insert({
                        data: serialized,
                        id: game.id,
                    });
                this.log(`Game ${game.id} inserted`);
            }
        });
    }

    private createGame(gameId: string, host: string) {
        const game = this.games[gameId] = new ServerGame(gameId, host, this.types);
        game.name = "unnamed";

        this.log(`Game ${game.id} created`);

        this.watchGame(game);
    }

    private async loadGames() {
        const games = await this.db
            .table("game")
            .select();

        return Promise.all(R.map((game: any) => this.loadGame(game.id, game.host, JSON.parse(game.data)), games));
    }

    private async loadGame(id: string, host: string, data: any) {
        if (!data) {
            return;
        }

        const game = new ServerGame(id, host, this.types);
        try {
            game.deserialize(data);
        } catch (err) {
            this.log(`Game ${game.id} failed to load. ${err}. Dropping from database`);
            await this.db
                .table("game")
                .where("id", game.id)
                .del();

            return;
        }

        this.log(`Game ${game.id} loaded`);

        this.games[id] = game;

        this.watchGame(game);

        this.index.setGameStatus(game.serializeShort());
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

    @registerRPC(RPC.GameServerMethods.Action)
    private doAction(
        client: GameClient,
        params: RPC.GameServerMethods.IActionParams,
    ): RPC.GameServerMethods.IActionResponse {
        client.game.actionManager.deserialize(client.faction, params);
    }

    @registerRPC(RPC.GameServerMethods.RenameCity)
    private renameCity(
        client: GameClient,
        params: RPC.GameServerMethods.IRenameCityParams,
    ): RPC.GameServerMethods.IRenameCityResponse {
        const city = client.game.getCity(params.id);
        if (city.faction.id !== client.faction.id) {
            throw new Error(`Can't rename a city that's not owned by you`);
        }

        if (!params.name || params.name.length < 2) {
            throw new Error(`City names must be at least 2 characters long`);
        }

        city.name = params.name;

        client.game.emit("update");
    }
}
