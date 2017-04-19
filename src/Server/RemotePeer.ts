import * as WS from "ws";

import {Faction} from "../Common/Models";
import * as RPC from "../Common/RPC";

import {Joinable} from "./Joinable";
import {Lobby} from "./Lobby";
import {ServerGame} from "./ServerGame";

export class RemotePeer extends RPC.RemotePeer {
    public ws: WS;

    public joined: Joinable;

    public faction: Faction;
    private _factionType: string; // name of faction type in lobby

    constructor(id: string, ws: WS) {
        super(id);
        this.ws = ws;

        this.ws.on("close", () => {
            if (this.joined) {
                this.leave();
            }
        });
    }

    get lobby() {
        if (this.joined && this.joined.type === "lobby") {
            return this.joined as Lobby;
        }

        throw new Error("Client not in a lobby");
    }

    get game() {
        if (this.joined && this.joined.type === "game") {
            return this.joined as ServerGame;
        }

        throw new Error("Client not in a game");
    }

    get factionType() {
        return this._factionType;
    }

    set factionType(val: string) {
        this.assertLobby();

        this._factionType = val;
        this.lobby.emit("update");
    }

    public join(joinable: Joinable) {
        if (this.joined) {
            this.leave();
        }

        joinable.addPeer(this);
        this.joined = joinable;
    }

    public leave() {
        this.joined.removePeer(this);
        this.joined = null;
    }

    public assertLobby() {
        if (!this.lobby) {
            throw new Error("Client hasn't joined a lobby");
        }
    }

    public lobbySerialize() {
        return {
            factionType: this.factionType,
            id: this.id,
        };
    }
}
