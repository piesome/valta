import {v4 as uuid} from "uuid";

import * as RPC from "../Common/RPC";

import {RemotePeer} from "./RemotePeer";

export class Peer extends RPC.Peer<RemotePeer> {
    public server: RemotePeer;

    constructor() {
        super(uuid());
    }

    public connect(): Promise<void> {
        this.server = new RemotePeer(
            uuid(),
            new WebSocket("ws://localhost:3001"),
        );

        this.addPeer(this.server);

        this.server.ws.onclose = () => this.removePeer(this.server);
        this.server.ws.onmessage = (data) => {
            try {
                const json = JSON.parse(data.data);
                this.onMessage(this.server, json);
            } catch (e) {
                console.error(e);
            }
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

    public send(peer: RemotePeer, data: any) {
        data.jsonrpc = "2.0";
        const json = JSON.stringify(data);
        peer.ws.send(json);
    }
}
