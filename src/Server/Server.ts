import {v4 as uuid} from "uuid";
import * as WS from "ws";

import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {RemotePeer} from "./RemotePeer";
import {RPCHandler} from "./RPC";

export class Server extends RPC.Peer<RemotePeer> {
    private types: Types;
    private wss: WS.Server;

    constructor() {
        super();

        this.wss = new WS.Server({
            perMessageDeflate: false,
            port: 3001,
        });

        this.wss.on("connection", (x) => this.onConnection(x));

        this.types = new Types();
    }

    public async load() {
        return await this.types.load();
    }

    public addRPCHandler(rpcs: RPCHandler) {
        rpcs.register(this, this.types);
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
