import * as R from "ramda";

import {Game} from "Common/Game";
import {Types} from "Common/Types";

import {RemotePeer} from "../RemotePeer";
import {IJoinable} from "./Joinable";

export class ServerGame extends Game implements IJoinable {
    public type = "game";

    public peers: RemotePeer[];

    constructor(types: Types) {
        super(types);
        this.peers = [];
    }

    public addPeer(peer: RemotePeer) {
        const readyFaction = this.getFactionByPeerId(peer.id);
        if (readyFaction) {
            // client returning
            peer.faction = readyFaction;
        } else {
            // client joining for first time
            if (this.tick !== 0) {
                throw new Error("New peer can't join in the middle of the game");
            }

            const faction = this.createFaction(peer.id, peer.factionType);
            peer.faction = faction;
        }

        this.peers.push(peer);
    }

    public removePeer(peer: RemotePeer) {
        this.peers = R.filter((x) => peer.id !== peer.id, this.peers);
    }
}
