import * as debug from "debug";
import * as Knex from "knex";
import * as WS from "ws";

import * as RPC from "Common/RPC";

export class IndexServer extends RPC.RemotePeer {
    public authenticatedId: string;
    public authenticatedSecret: string;

    private ws: WS;
    private db: Knex;
    private log: debug.IDebugger;

    constructor(db: Knex, private indexUrl: string) {
        super();
        this.db = db;
        this.log = debug("valta:IndexServer");
    }

    public connect(): Promise<void> {
        this.ws = new WS(this.indexUrl);

        this.log(`Connecting to ${this.indexUrl}`);

        this.ws.on("close", () => {
            this.log(`Connection closed`);
            setTimeout(() => {
                this.connect();
            }, 1000);
        });

        this.ws.on("error", (err) => {
            this.log(`Error ${err}`);
        });

        this.ws.on("message", (data) => {
            this.onMessage(data);
        });

        return new Promise<void>((accept, reject) => {
            this.ws.on("open", () => {
                this.log(`Connection opened`);
                this.onOpen().then(() => accept(), (err) => reject(err));
            });
        });
    }

    public async setGameStatus(params: RPC.IndexServerMethods.ISetGameStatusParams) {
        return await this.call(RPC.IndexServerMethods.SetGameStatus, params);
    }

    public async deleteGameStatus(params: RPC.IndexServerMethods.IDeleteGameStatusParams) {
        return await this.call(RPC.IndexServerMethods.DeleteGameStatus, params);
    }

    protected send(data: string) {
        this.ws.send(data);
    }

    private async onOpen() {
        const gameUrl = "ws://localhost:30320";
        let config = await this.db
            .table("config")
            .first("id", "secret");

        if (config) {
            this.log(`Trying authentication as ${config.id}`);

            try {
                await this.call<RPC.IndexServerMethods.IAuthenticateGameServerParams, void>(
                    RPC.IndexServerMethods.AuthenticateGameServer,
                    {
                        id: config.id,
                        secret: config.secret,
                        url: gameUrl,
                    },
                );
                this.log(`Authentication complete`);
                this.authenticatedId = config.id;
                this.authenticatedSecret = config.secret;
                return;
            } catch (err) {
                this.log(`Authentication failed`);
            }
        }

        this.log(`Trying registeration`);

        try {
            config = await this.call<
                RPC.IndexServerMethods.IRegisterGameServerParams,
                RPC.IndexServerMethods.IRegisterGameServerResponse
            >(
                RPC.IndexServerMethods.RegisterGameServer,
                {
                    url: gameUrl,
                },
            );
        } catch (err) {
            this.log(err);
            throw err;
        }

        await this.db
            .table("config")
            .del();

        await this.db
            .table("config")
            .insert(config);

        this.authenticatedId = config.id;
        this.authenticatedSecret = config.secret;
        this.log(`Registered as ${config.id}`);
    }
}
