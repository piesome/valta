import {v4 as uuid} from "uuid";

import * as RPC from "Common/RPC";

import {RemotePeer} from "./RemotePeer";

export class Peer extends RPC.Peer<RemotePeer> {
    public server: RemotePeer;

    constructor() {
        super();
    }

    public connect(): Promise<void> {
        this.server = new RemotePeer(
            new WebSocket("ws://localhost:3001"),
        );

        this.addPeer(this.server);

        this.register<RPC.ClientMethods.IAdjustIdsParams, void>(RPC.ClientMethods.AdjustIds, (client, params) => {
            this.id = params.youAre;
            this.server.id = params.iAm;
        });

        return new Promise<void>((accept, reject) => {
            this.server.on("open", () => {
                accept();
            });
        });
    }
}
