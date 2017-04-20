import * as RPC from "Common/RPC";

export class RemotePeer extends RPC.RemotePeer {
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        super();

        this.ws = ws;

        this.ws.onmessage = (event) => {
            this.onMessage(event.data);
        };

        this.ws.onclose = () => {
            this.emit("close");
        };

        this.ws.onopen = () => {
            this.emit("open");
        };
    }

    public updateLobbies(): Promise<RPC.ServerMethods.IListLobbiesResponse> {
        return this.callNoParams<RPC.ServerMethods.IListLobbiesResponse>(RPC.ServerMethods.ListLobbies);
    }

    public createLobby(): Promise<RPC.ServerMethods.ICreateLobbyResponse> {
        return this.callNoParams<RPC.ServerMethods.ICreateLobbyResponse>(RPC.ServerMethods.CreateLobby);
    }

    public leaveLobby() {
        return this.callNoParams<void>(RPC.ServerMethods.LeaveLobby);
    }

    public joinLobby(params: RPC.ServerMethods.IJoinLobbyParams) {
        return this.call<RPC.ServerMethods.IJoinLobbyParams, RPC.ServerMethods.IJoinLobbyResponse>(
            RPC.ServerMethods.JoinLobby,
            params,
        );
    }

    public startGame() {
        return this.callNoParams<void>(RPC.ServerMethods.StartGame);
    }

    public selectFaction(params: RPC.ServerMethods.ISelectFactionParams) {
        return this.call<RPC.ServerMethods.ISelectFactionParams, null>(RPC.ServerMethods.SelectFaction, params);
    }

    public send(data: string) {
        this.ws.send(data);
    }
}
