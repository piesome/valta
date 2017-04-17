import * as EE from "events";

import {v4 as uuid} from "uuid";
import * as R from "ramda";

import {Types} from "valta.common/src/Types";
import {TerrainGenerator} from "valta.common/src/TerrainGenerator";

import {Joinable} from "./Joinable";
import {ServerGame} from "./ServerGame";
import {RemotePeer} from "./RemotePeer";


export class Lobby extends EE implements Joinable {
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

    addPeer(peer: RemotePeer) {
        this.peers.push(peer);
        this.emit("update");
    }

    removePeer(peer: RemotePeer) {
        this.peers = R.filter(x => x.id !== peer.id, this.peers);
        this.emit("update");

        if (this.canBeRemoved()) {
            this.emit("canBeRemoved");
        }
    }

    canBeStarted() {
        return this.peers.length >= 2 && R.all(x => !!x.factionType, this.peers);
    }

    canBeRemoved() {
        return this.peers.length === 0;
    }

    /**
     * Probably doesn't belong here
     * @param types
     */
    start(types: Types): ServerGame {
        const game = new ServerGame(types);
        (new TerrainGenerator(game, 3)).generate();

        this.peers.map(x => x.join(game));

        return game;
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            peers: this.peers.map(x => x.lobbySerialize()),
            canBeStarted: this.canBeStarted()
        };
    }
}
