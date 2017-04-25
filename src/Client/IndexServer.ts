import * as RPC from "Common/RPC";

export class IndexServer extends RPC.RemotePeer {
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

    public listGames(): Promise<RPC.IndexServerMethods.IListGamesResponse> {
        return this.call<RPC.IndexServerMethods.IListGamesParams, RPC.IndexServerMethods.IListGamesResponse>(
            RPC.IndexServerMethods.ListGames,
            {},
        );
    }

    public createGame(): Promise<RPC.IndexServerMethods.ICreateGameResponse> {
        return this.callNoParams<RPC.IndexServerMethods.ICreateGameResponse>(
            RPC.IndexServerMethods.CreateGame,
        );
    }

    public joinGame(id: string): Promise<RPC.IndexServerMethods.IJoinGameResponse> {
        const params = {id};
        return this.call<RPC.IndexServerMethods.IJoinGameParams, RPC.IndexServerMethods.IJoinGameResponse>(
            RPC.IndexServerMethods.JoinGame,
            params,
        );
    }

    public async authenticate() {
        const config = window.localStorage.getItem("config");
        if (config) {
            const configData = JSON.parse(config);
            try {
                await this.authenticateWith(configData.id, configData.secret);
                this.emit("id", configData.id);
                return;
            } catch (err) {
                console.error(err);
            }
        }

        const registered = await this.register();

        this.emit("id", registered.id);
        window.localStorage.setItem("config", JSON.stringify(registered));
    }

    protected send(data: string) {
        this.ws.send(data);
    }

    private async authenticateWith(id: string, secret: string) {
        try {
            return await this.call<RPC.IndexServerMethods.IAuthenticateParams, void>(
                RPC.IndexServerMethods.Authenticate,
                {
                    id,
                    secret,
                },
            );
        } catch (err) {
            throw err;
        }
    }

    private async register() {
        return await this.callNoParams<RPC.IndexServerMethods.IRegisterResponse>(
            RPC.IndexServerMethods.Register,
        );
    }

}
