import * as R from "ramda";

import {Game} from "valta.common/src/Game";
import {Types} from "valta.common/src/Types";

import {Joinable} from "./Joinable";
import {RemotePeer} from "./RemotePeer";


export class ServerGame extends Game implements Joinable {
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
        this.peers = R.filter(x => peer.id !== peer.id, this.peers);
    }
}
