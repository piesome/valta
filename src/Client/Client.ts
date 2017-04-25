import {v4 as uuid} from "uuid";

import * as RPC from "Common/RPC";

import {GameServer} from "./GameServer";
import {IndexServer} from "./IndexServer";

export class Client extends RPC.Peer<GameServer | IndexServer> {
    public gameServer: GameServer;
    public indexServer: IndexServer;

    constructor() {
        super();
    }

    public connectToGame(url: string): Promise<void> {
        if (this.gameServer) {
            this.gameServer.close();
        }

        this.gameServer = new GameServer(
            new WebSocket(url),
        );

        this.addPeer(this.gameServer);

        return new Promise<void>((accept, reject) => {
            this.gameServer.on("open", () => {
                accept();
            });
        });
    }

    public connect(): Promise<void> {
        this.indexServer = new IndexServer(
            new WebSocket("ws://localhost:30321"),
        );

        this.addPeer(this.indexServer);

        this.indexServer.on("id", (id: string) => {
            this.id = id;
        });

        return new Promise<void>((accept, reject) => {
            this.indexServer.on("open", () => {
                this.indexServer.authenticate()
                    .then(() => accept())
                    .catch((err) => reject(err));
            });
        });
    }
}
