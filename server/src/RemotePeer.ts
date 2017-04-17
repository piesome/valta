import * as WS from "ws";

import * as RPC from "valta.common/src/RPC";
import {Faction} from "valta.common/src/Models";

import {Lobby} from "./Lobby";
import {ServerGame} from "./ServerGame";
import {Joinable} from "./Joinable";


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
            return <Lobby>this.joined;
        }

        throw new Error("Client not in a lobby");
    }

    get game() {
        if (this.joined && this.joined.type === "game") {
            return <ServerGame>this.joined;
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

    join(joinable: Joinable) {
        if (this.joined) {
            this.leave();
        }

        joinable.addPeer(this);
        this.joined = joinable;
    }

    leave() {
        this.joined.removePeer(this);
        this.joined = null;
    }

    assertLobby() {
        if (!this.lobby) {
            throw new Error("Client hasn't joined a lobby");
        }
    }

    lobbySerialize() {
        return {
            factionType: this.factionType
        };
    }
}
