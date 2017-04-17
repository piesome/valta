import * as EE from "events";

import {v4 as uuid} from "uuid";
import * as R from "ramda";

import {Types} from "valta.common/src/Types";
import {TerrainGenerator} from "valta.common/src/TerrainGenerator";
import {Faction} from "valta.common/src/Models";

import {ServerGame} from "./ServerGame";
import {RemotePeer} from "./RemotePeer";


export class Lobby extends EE {
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
        peer.assertNotInLobby();

        this.peers.push(peer);

        peer.lobby = this;

        this.emit("update");
    }

    removePeer(peer: RemotePeer) {
        this.peers = R.filter(x => peer.id !== peer.id, this.peers);

        peer.lobby = null;

        this.emit("update");
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

        let canAct = true;

        for (const peer of this.peers) {
            const faction = new Faction(
                uuid(),
                types.faction.getType(peer.factionType),
                canAct,
                types.upgrade.automaticallyUnlocked()
            );

            game.clientsFaction(peer, faction);
            canAct = false;

            peer.lobby = null;
        }

        this.peers = [];

        return game;
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            lobbyUsers: this.peers.map(x => x.lobbySerialize()),
            canBeStarted: this.canBeStarted()
        };
    }
}
