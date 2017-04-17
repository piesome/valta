import * as WS from "ws";

import * as RPC from "valta.common/src/RPC";
import {Game} from "valta.common/src/Game";
import {Faction} from "valta.common/src/Models";

import {Lobby} from "./Lobby";


export class RemotePeer extends RPC.RemotePeer {
    public ws: WS;
    public lobby: Lobby;
    public game: Game;
    public faction: Faction;
    public factionType: string; // name of faction type in lobby

    constructor(id: string, ws: WS) {
        super(id);
        this.ws = ws;
    }

    assertGame() {
        if (!this.game) {
            throw new Error("Client hasn't joined a game");
        }
    }

    assertFaction() {
        if (!this.faction) {
            throw new Error("Client hasn't created a faction");
        }
    }

    assertLobby() {
        if (!this.lobby) {
            throw new Error("Client hasn't joined a lobby");
        }
    }

    assertNotInLobby() {
        if (this.lobby) {
            throw new Error("Client is in a lobby");
        }
    }

    lobbySerialize() {
        return {
            factionType: this.factionType
        };
    }
}
