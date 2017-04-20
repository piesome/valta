import * as R from "ramda";

import {Game} from "Common/Game";
import {Types} from "Common/Types";

import {IJoinable} from "./Joinable";
import {RemotePeer} from "./RemotePeer";

export class ServerGame extends Game implements IJoinable {
    public type = "game";

    public peers: RemotePeer[];

    constructor(types: Types) {
        super(types);
        this.peers = [];
    }

    public addPeer(peer: RemotePeer) {
        this.peers.push(peer);
        const faction = this.createFaction(peer.factionType);
        peer.faction = faction;
    }

    public removePeer(peer: RemotePeer) {
        this.peers = R.filter((x) => peer.id !== peer.id, this.peers);
    }
}
