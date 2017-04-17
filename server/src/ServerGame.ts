import {Game} from "valta.common/src/Game";
import {Types} from "valta.common/src/Types";
import {Faction} from "valta.common/src/Models";

import {RemotePeer} from "./RemotePeer";


export class ServerGame extends Game {
    public clients: RemotePeer[];

    constructor(types: Types) {
        super(types);
        this.clients = [];
    }

    public clientsFaction(peer: RemotePeer, faction: Faction) {
        this.clients.push(peer);
        this.addFaction(faction);
        peer.faction = faction;
        peer.game = this;
    }
}
