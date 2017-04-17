import {v4 as uuid} from "uuid";

import * as RPC from "valta.common/src/RPC";

export class RemotePeer extends RPC.RemotePeer {
    public ws: WebSocket;

    constructor(id: string, ws: WebSocket) {
        super(id);
        this.ws = ws;
    }
}

export class Peer extends RPC.Peer<RPC.RemotePeer> {
    public server: RemotePeer;

    constructor() {
        super(uuid());
    }

    connect(): Promise<void> {
        this.server = new RemotePeer(
            uuid(),
            new WebSocket("ws://localhost:3001")
        );

        this.addPeer(this.server);

        this.server.ws.onclose = () => this.removePeer(this.server);
        this.server.ws.onmessage = (data) => {
            try {
                const json = JSON.parse(data.data);
                this.onMessage(this.server, json);
            } catch (e) {}
        };

        this.on(RPC.AdjustIds.name, (data: RPC.AdjustIds.Params) => {
            this.id = data.youAre;
            this.server.id = data.iAm;
        });

        return new Promise<void>((accept, reject) => {
            this.server.ws.onopen = () => {
                accept();
            };
        });
    }

    send(peer: RemotePeer, data: any) {
        data.jsonrpc = "2.0";
        const json = JSON.stringify(data);
        peer.ws.send(json);
    }
}