import * as WS from "ws";
import {v4 as uuid} from "uuid";

import * as RPC from "valta.common/src/RPC";
import {RemotePeer} from "./RemotePeer";


export class Server extends RPC.Peer<RemotePeer> {
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
