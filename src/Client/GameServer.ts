import * as RPC from "Common/RPC";

export class GameServer extends RPC.RemotePeer {
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        super();

        this.ws = ws;

        this.ws.onmessage = (event) => {
            this.onMessage(event.data);
        };

        this.ws.onclose = (ev: CloseEvent) => {
            this.emit("close", new Error(ev.reason));
        };

        this.ws.onopen = () => {
            this.emit("open");
        };
    }

    public startGame() {
        return this.callNoParams<void>(RPC.GameServerMethods.StartGame);
    }

    public selectFaction(params: RPC.GameServerMethods.ISelectFactionParams) {
        return this.call<RPC.GameServerMethods.ISelectFactionParams, null>(RPC.GameServerMethods.SelectFaction, params);
    }

    public action(params: RPC.GameServerMethods.IActionParams) {
        return this.call<RPC.GameServerMethods.IActionParams, RPC.GameServerMethods.IActionResponse>(
            RPC.GameServerMethods.Action,
            params,
        );
    }

    public endTurn() {
        return this.callNoParams<void>(RPC.GameServerMethods.EndTurn);
    }

    public close() {
        this.ws.close();
    }

    public send(data: string) {
        this.ws.send(data);
    }
}
