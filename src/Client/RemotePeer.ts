import * as RPC from "../Common/RPC";

export class RemotePeer extends RPC.RemotePeer {
    public ws: WebSocket;

    constructor(id: string, ws: WebSocket) {
        super(id);
        this.ws = ws;
    }
}
