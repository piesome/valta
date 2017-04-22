import {EventEmitter} from "eventemitter3";
import * as R from "ramda";
import {v4 as uuid} from "uuid";

import {TerrainGenerator} from "Common/TerrainGenerator";
import {Types} from "Common/Types";

import {IJoinable} from "./Joinable";
import {RemotePeer} from "./RemotePeer";
import {ServerGame} from "./ServerGame";

export class Lobby extends EventEmitter implements IJoinable {
    public type = "lobby";

    public peers: RemotePeer[];
    public name: string;
    public id: string;

    constructor() {
        super();

        this.id = uuid();
        this.name = "unnamed";
        this.peers = [];
    }

    public addPeer(peer: RemotePeer) {
        this.peers.push(peer);
        this.emit("update");
    }

    public removePeer(peer: RemotePeer) {
        this.peers = R.filter((x) => x.id !== peer.id, this.peers);
        this.emit("update");

        if (this.canBeRemoved()) {
            this.emit("canBeRemoved");
        }
    }

    public canBeStarted() {
        return this.peers.length >= 2 && R.all((x) => !!x.factionType, this.peers);
    }

    public canBeRemoved() {
        return this.peers.length === 0;
    }

    public serialize() {
        return {
            canBeStarted: this.canBeStarted(),
            id: this.id,
            name: this.name,
            peers: this.peers.map((x) => x.lobbySerialize()),
        };
    }
}
