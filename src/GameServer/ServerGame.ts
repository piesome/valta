import * as R from "ramda";

import {Game} from "Common/Game";
import {Types} from "Common/Types";

import {GameClient} from "./GameClient";

export class ServerGame extends Game {
    public peers: GameClient[];

    constructor(id: string, host: string, types: Types) {
        super(types);
        this.id = id;
        this.host = host;
        this.peers = [];

        this.on("update", () => {
            // TODO: localized views for each faction
            const gs = this.serialize();
            R.map((peer: GameClient) => peer.gameUpdate(gs), this.peers);
        });
    }

    public canBeRemoved() {
        if (this.status === "lobby" && this.peers.length === 0) {
            return true;
        }
    }

    public addPeer(peer: GameClient) {
        try {
            const readyFaction = this.getFaction(peer.id);
            peer.faction = readyFaction;
            this.peers.push(peer);
            peer.gameUpdate(this.serialize());
        } catch (e) {
            this.assertLobby();

            this.peers.push(peer);

            const faction = this.createFaction(peer.id);
            peer.faction = faction;
        }
    }

    public removePeer(peer: GameClient) {
        this.peers = R.filter((x) => x.id !== peer.id, this.peers);

        if (this.status !== "lobby") {
            return;
        }

        this.removeFaction(peer.id);

        if (this.canBeRemoved()) {
            this.emit("canBeRemoved");
        }
    }
}
