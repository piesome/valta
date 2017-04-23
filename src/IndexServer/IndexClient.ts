import * as WS from "ws";

import * as RPC from "Common/RPC";

export interface IGameServer {
    id: string;
    secret: string;
    url: string;
}

export class IndexClient extends RPC.RemotePeer {
    public type: string;
    public gameServer: IGameServer;
    public client: boolean;

    constructor(private ws: WS) {
        super();

        this.client = false;

        this.ws.on("close", () => {
            this.emit("close");
        });

        this.ws.on("open", () => {
            this.emit("open");
        });

        this.ws.on("message", (data) => {
            this.onMessage(data);
        });
    }

    public assertIsNothing() {
        if (this.client || this.gameServer) {
            throw new Error("Peer is something");
        }
    }

    public assertNotAClient() {
        if (this.client) {
            throw new Error("Peer authenticated as a client");
        }
    }

    public assertClient() {
        if (!this.client) {
            throw new Error("Client hasn't authenticated or registered");
        }
    }

    public assertGameServer() {
        if (!this.gameServer) {
            throw new Error("Not a game server");
        }
    }

    public assertNoGameServer() {
        if (this.gameServer) {
            throw new Error("Already a game server");
        }
    }

    protected send(data: string) {
        this.ws.send(data);
    }
}
