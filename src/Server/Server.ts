import {v4 as uuid} from "uuid";
import * as WS from "ws";

import * as RPC from "Common/RPC";

import {RemotePeer} from "./RemotePeer";

export class Server extends RPC.Peer<RemotePeer> {
    private wss: WS.Server;

    constructor() {
        super();

        this.wss = new WS.Server({
            perMessageDeflate: false,
            port: 3001,
        });

        this.wss.on("connection", (x) => this.onConnection(x));
    }

    private onConnection(ws: WS) {
        const id = uuid();
        const peer = new RemotePeer(ws);
        this.addPeer(peer);

        peer.adjustIds({
            iAm: this.id,
            youAre: id,
        });
    }
}
