import * as WS from "ws";

import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";

import {IJoinable} from "./Models/Joinable";
import {Lobby} from "./Models/Lobby";
import {ServerGame} from "./Models/ServerGame";

export class RemotePeer extends RPC.RemotePeer {
    public ws: WS;

    public joined: IJoinable;

    public faction: Faction;
    private selectedFactionType: string;

    constructor(ws: WS) {
        super();
        this.ws = ws;

        this.ws.on("close", () => {
            if (this.joined) {
                this.leave();
            }
            this.emit("close");
        });

        this.ws.on("open", () => {
            this.emit("open");
        });

        this.ws.on("message", (data) => {
            this.onMessage(data);
        });
    }

    public lobbyUpdate(params: RPC.ClientMethods.ILobbyUpdateParams) {
        return this.call(RPC.ClientMethods.LobbyUpdate, params);
    }

    public gameUpdate(params: RPC.ClientMethods.IGameUpdateParams) {
        return this.call(RPC.ClientMethods.GameUpdate, params);
    }

    public gameStarted(params: RPC.ClientMethods.IGameStartedParams) {
        return this.call(RPC.ClientMethods.GameStarted, params);
    }

    public adjustIds(params: RPC.ClientMethods.IAdjustIdsParams) {
        return this.call<RPC.ClientMethods.IAdjustIdsParams, void>(RPC.ClientMethods.AdjustIds, params);
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
        return this.selectedFactionType;
    }

    set factionType(val: string) {
        this.assertLobby();

        this.selectedFactionType = val;
        this.lobby.emit("update");
    }

    public join(joinable: IJoinable) {
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

    public endTurn() {
        if (this.game && !this.faction.canAct) {
            throw new Error("Can't end turn when it's not your turn");
        }
        this.game.endTurn();
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

    protected send(data: string) {
        this.ws.send(data);
    }
}
