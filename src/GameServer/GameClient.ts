import * as WS from "ws";

import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";

import {ServerGame} from "./ServerGame";

export class GameClient extends RPC.RemotePeer {
    public ws: WS;

    public faction: Faction;

    private joinedGame: ServerGame;

    constructor(id: string, ws: WS) {
        super(id);
        this.ws = ws;

        this.ws.on("close", () => {
            this.game = null;
            this.emit("close");
        });

        this.ws.on("open", () => {
            this.emit("open");
        });

        this.ws.on("message", (data) => {
            this.onMessage(data);
        });
    }

    public get game() {
        if (!this.joinedGame) {
            throw new Error("Client is not in any game");
        }

        return this.joinedGame;
    }

    public set game(value: ServerGame) {
        if (value) {
            value.addPeer(this);
        } else if (this.joinedGame) {
            this.joinedGame.removePeer(this);
        }

        this.joinedGame = value;
    }

    public gameUpdate(params: RPC.ClientMethods.IGameUpdateParams) {
        return this.call(RPC.ClientMethods.GameUpdate, params);
    }

    public adjustIds(params: RPC.ClientMethods.IAdjustIdsParams) {
        return this.call<RPC.ClientMethods.IAdjustIdsParams, void>(RPC.ClientMethods.AdjustIds, params);
    }

    public endTurn() {
        if (this.joinedGame && !this.faction.canAct) {
            throw new Error("Can't end turn when it's not your turn");
        }
        this.joinedGame.endTurn();
    }

    protected send(data: string) {
        this.ws.send(data);
    }
}
