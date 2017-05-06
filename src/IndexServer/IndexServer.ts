import * as crypto from "crypto";
import * as url from "url";

import * as debug from "debug";
import * as jwt from "jsonwebtoken";
import * as Knex from "knex";
import * as R from "ramda";
import {v4 as uuid} from "uuid";
import * as WS from "ws";

import * as RPC from "Common/RPC";
import {registerRPC, registerRPCs} from "Common/RPC";
import {promisify} from "Common/Util";

import {IGameServer, IndexClient} from "./IndexClient";

interface IGame {
    id: string;
    name: string;
    status: string;
    factionCount: number;
    gameServer: IGameServer;
}

interface IListGame {
    id: string;
    name: string;
    status: string;
    factionCount: number;
}

export class IndexServer extends RPC.Peer<IndexClient> {
    private games: {[id: string]: IGame};
    private wss: WS.Server;
    private db: Knex;
    private log: debug.IDebugger;

    constructor() {
        super();

        this.games = {};

        this.log = debug("valta:IndexServer");

        this.wss = new WS.Server({
            host: "0.0.0.0",
            port: 30321,
        });
    }

    public async load() {
        registerRPCs(this);

        this.db = Knex(require("../../knexfile")[process.env.NODE_ENV]);

        this.wss.on("connection", (ws) => this.onConnection(ws));
    }

    private removeGame(id: string) {
        delete this.games[id];
        this.log(`Game ${id} removed`);
    }

    private onConnection(ws: WS) {
        const peer = new IndexClient(ws);

        this.log(`New peer ${peer.id}`);

        peer.on("close", () => {
            if (!peer.gameServer) {
                return;
            }

            const gamesToRemove = R.filter((game) => game.gameServer.id === peer.gameServer.id, R.values(this.games));
            R.map((x) => this.removeGame(x.id), gamesToRemove);
        });

        this.addPeer(peer);
    }

    private randomGameServer() {
        // TODO: optimise
        const toChooseFrom = R.values(this.peers).map((x) => x.gameServer).filter((x) => !!x);
        if (toChooseFrom.length === 0) {
            throw new Error("No game servers (panic!)");
        }

        return toChooseFrom[Math.floor(Math.random() * toChooseFrom.length)];
    }

    private generateConnectUrl(clientId: string, gameId: string, gameServer: IGameServer) {
        const payload = {
            game: {
                host: clientId,
                id: gameId,
            },
            peer: {
                id: clientId,
            },
        };

        const token = jwt.sign(payload, gameServer.secret, {
            algorithm: "HS512",
            audience: gameServer.id,
            expiresIn: "24H",
        });

        const parsedUrl = url.parse(gameServer.url, true);
        parsedUrl.query.token = token;

        return url.format(parsedUrl);
    }

    // client -> index server

    @registerRPC(RPC.IndexServerMethods.ListGames)
    private listGames(
        client: IndexClient,
        params: RPC.IndexServerMethods.IListGamesParams,
    ): RPC.IndexServerMethods.IListGamesResponse {
        client.assertClient();

        const games: IListGame[] = R.values(this.games);

        return {
            games,
        };
    }

    @registerRPC(RPC.IndexServerMethods.JoinGame)
    private joinGame(
        client: IndexClient,
        params: RPC.IndexServerMethods.IJoinGameParams,
    ): RPC.IndexServerMethods.IJoinGameResponse {
        client.assertClient();

        const game = this.games[params.id];
        if (!game) {
            throw new Error("No such game");
        }

        return {
            url: this.generateConnectUrl(client.id, game.id, game.gameServer),
        };
    }

    @registerRPC(RPC.IndexServerMethods.CreateGame)
    private createGame(
        client: IndexClient,
        params: RPC.IndexServerMethods.ICreateGameParams,
    ): RPC.IndexServerMethods.ICreateGameResponse {
        client.assertClient();

        const gameId = uuid();
        const gameServer = this.randomGameServer();

        return {
            url: this.generateConnectUrl(client.id, gameId, gameServer),
        };
    }

    @registerRPC(RPC.IndexServerMethods.Register)
    private async registerClient(
        client: IndexClient,
        params: RPC.IndexServerMethods.IRegisterParams,
    ): Promise<RPC.IndexServerMethods.IRegisterGameServerResponse> {
        client.assertIsNothing();

        const id = client.id;
        const secret = uuid(); // TODO: something less confusing & better
        const salt = await promisify<Buffer>(crypto.randomBytes, [32]);
        const iterations = 10000;
        const keylen = 512;
        const digest = "sha512";

        const key = await promisify<Buffer>(crypto.pbkdf2, [secret, salt, iterations, keylen, digest]);
        const secretHash = `${key.toString("base64")} ${salt.toString("base64")} ${iterations} ${keylen} ${digest}`;

        try {
            await this.db
                .table("client")
                .insert({
                    id,
                    secret_hash: secretHash,
                });
        } catch (err) {
            throw err;
        }

        this.log(`Client registered ${client.id}`);

        client.client = true;

        return {
            id,
            secret,
        };
    }

    @registerRPC(RPC.IndexServerMethods.Authenticate)
    private async authenticateClient(
        client: IndexClient,
        params: RPC.IndexServerMethods.IAuthenticateParams,
    ): Promise<RPC.IndexServerMethods.IAuthenticateResponse> {
        client.assertIsNothing();

        let secretHash;

        try {
            const data = await this.db
                .table("client")
                .first("secret_hash")
                .where("id", params.id);

            if (!data) {
                throw new Error("Not in database");
            }

            secretHash = data.secret_hash;
        } catch (err) {
            // TODO: fix id finding by timings (do we even care)
            throw new Error("Authentication failed");
        }

        const parts = secretHash.split(" ");
        const targetKey = Buffer.from(parts[0], "base64");
        const salt = Buffer.from(parts[1], "base64");
        const iterations = Number(parts[2]);
        const keylen = Number(parts[3]);
        const digest = parts[4];

        const key = await promisify<Buffer>(crypto.pbkdf2, [params.secret, salt, iterations, keylen, digest]);
        if (key.compare(targetKey) !== 0) {
            throw new Error("Authentication failed");
        }

        this.log(`Client authenticated ${client.id} -> ${params.id}`);

        client.id = params.id;
        client.client = true;
    }

    // game server -> index server

    @registerRPC(RPC.IndexServerMethods.RegisterGameServer)
    private async registerGameServer(
        client: IndexClient,
        params: RPC.IndexServerMethods.IRegisterGameServerParams,
    ): Promise<RPC.IndexServerMethods.IRegisterGameServerResponse> {
        client.assertIsNothing();

        const url = params.url;
        const id = client.id;
        const secret = uuid(); // TODO: something less confusing & better

        try {
            await this.db
                .table("game_server")
                .insert({
                    id,
                    secret,
                });
        } catch (err) {
            throw err;
        }

        this.log(`Game server registered ${client.id}`);
        client.gameServer = {
            id,
            secret,
            url,
        };

        return {
            id,
            secret,
        };
    }

    @registerRPC(RPC.IndexServerMethods.AuthenticateGameServer)
    private async authenticateGameServer(
        client: IndexClient,
        params: RPC.IndexServerMethods.IAuthenticateGameServerParams,
    ): Promise<RPC.IndexServerMethods.IAuthenticateGameServerResponse> {
        client.assertIsNothing();

        const data = await this.db
            .table("game_server")
            .first("id", "secret")
            .where({
                id: params.id,
                secret: params.secret,
            });

        if (!data) {
            throw new Error("No such game_server");
        }

        this.log(`Game server authenticatied ${client.id} -> ${params.id}`);
        client.id = params.id;
        client.gameServer = {
            id: params.id,
            secret: params.secret,
            url: params.url,
        };
    }

    @registerRPC(RPC.IndexServerMethods.SetGameStatus)
    private setGameStatus(
        client: IndexClient,
        params: RPC.IndexServerMethods.ISetGameStatusParams,
    ): RPC.IndexServerMethods.ISetGameStatusResponse {
        client.assertGameServer();

        if (this.games[params.id]) {
            if (this.games[params.id].gameServer.id !== client.gameServer.id) {
                throw new Error("Can't update other game servers game");
            }
        }

        this.games[params.id] = {
            factionCount: params.factionCount,
            gameServer: client.gameServer,
            id: params.id,
            name: params.name,
            status: params.status,
        };

        this.log(`Game ${params.id} updated`);
    }

    @registerRPC(RPC.IndexServerMethods.DeleteGameStatus)
    private deleteGameStatus(
        client: IndexClient,
        params: RPC.IndexServerMethods.IDeleteGameStatusParams,
    ): RPC.IndexServerMethods.IDeleteGameStatusResponse {
        client.assertGameServer();

        if (!this.games[params.id]) {
            throw new Error("No such game");
        }

        if (this.games[params.id].gameServer.id !== client.gameServer.id) {
            throw new Error("Can't delete other game servers game");
        }

        this.removeGame(params.id);
    }
}
