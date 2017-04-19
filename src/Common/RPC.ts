import {EventEmitter} from "eventemitter3";

import {v4 as uuid} from "uuid";

import * as GS from "./GameState";

export type RPCFn<T, Params, Response> = (client: T, params: Params) => Response;

/*
export interface IRPC<Name extends string, Params, Response> {
    name: Name;
    call(peer: RemotePeer, params: Params): Response;
}

export interface IListLobbiesResponse {
    lobbyIds: GS.ID[];
}
export type IListLobbies = IRPC<"ListLobbies", void, IListLobbiesResponse>;

export interface ICreateLobbyResponse {
    id: GS.ID;
}
export type ICreateLobby = IRPC<"CreateLobby", void, ICreateLobbyResponse>;

export interface IJoinLobbyParams {
    id: GS.ID;
}
export type IJoinLobby = IRPC<"JoinLobby", IJoinLobbyParams, void>;

export type ILeaveLobby = IRPC<"LeaveLobby", void, void>;

export interface ISelectFactionParams {
    factionType: GS.FactionType;
}
export type ISelectFaction = IRPC<"SelectFaction", ISelectFactionParams, void>;

export type IStartGame = IRPC<"StartGame", void, void>;

export type IGetGameStateResponse = GS.IGameState;
export type IGetGameState = IRPC<"GetGameState", void, IGetGameStateResponse>;
*/

export namespace ListLobbies {
    export const name = "ListLobbies";
    export interface Params {}
    export interface Response {
        lobbyIds: GS.ID[];
    }
}

export namespace CreateLobby {
    export const name = "CreateLobby";
    export interface Params {}
    export interface Response {
        id: GS.ID;
    }
}

export namespace JoinLobby {
    export const name = "JoinLobby";
    export interface Params {
        id: GS.ID;
    }
    export interface Response {}
}

export namespace LeaveLobby {
    export const name = "LeaveLobby";
    export interface Params {}
    export interface Response {}
}

export namespace SelectFaction {
    export const name = "SelectFaction";
    export interface Params {
        factionType: GS.FactionType;
    }
    export interface Response {}
}

export namespace StartGame {
    export const name = "StartGame";
    export interface Params {}
    export interface Response {}
}

export namespace GetGameState {
    export const name = "GetGameState";
    export interface Params {}
    export type Response = GS.IGameState;
}

/**
 * Todo automatically populated from above
 */
export const SERVER_METHODS = [
    GetGameState.name,
    StartGame.name,
    SelectFaction.name,
    LeaveLobby.name,
    JoinLobby.name,
    CreateLobby.name,
    ListLobbies.name,
];

export namespace LobbyUpdate {
    export const name = "LobbyUpdate";
    export interface Params {
        id: GS.ID;
        name: string;
        peers: Array<{
            id: GS.ID,
            factionType: string,
        }>;
        canBeStarted: boolean;
    }
}

export namespace GameUpdate {
    export const name = "GameUpdate";
    export type Params = GS.IGameState;
}

export namespace GameStarted {
    export const name = "GameStarted";
    export interface Params {
        gameState: GS.IGameState;
        faction: GS.IFaction;
    }
}

export namespace AdjustIds {
    export const name = "AdjustIds";
    export interface Params {
        youAre: GS.ID;
        iAm: GS.ID;
    }
}

export type RPCPeerCB<T> = (peer: T, data: any) => void;

export abstract class RemotePeer extends EventEmitter {
    constructor(
        public id: string,
    ) {
        super();
    }
}

export abstract class Peer<T extends RemotePeer> extends EventEmitter {
    private localMethods: {[name: string]: RPCFn<T, any, any>};
    private ongoingCalls: {[id: string]: RPCPeerCB<T>};
    private peers: {[id: string]: T};

    constructor(
        public id: string,
    ) {
        super();
        this.localMethods = {};
        this.peers = {};
        this.ongoingCalls = {};
    }

    public addPeer(peer: T) {
        this.peers[peer.id] = peer;
    }

    public removePeer(peer: T) {
        delete this.peers[peer.id];
    }

    public register<Params, Response>(name: string, method: RPCFn<T, Params, Response>) {
        this.localMethods[name] = method;
    }

    public notifyPeer(peer: T, method: string, params: any) {
        const message = {
            method,
            params,
        };
        this.send(peer, message);
    }

    public callPeer<Response>(peer: T, method: string, params: any): Promise<Response> {
        const id = uuid();

        const message = {
            method,
            params,
            id,
        };

        this.send(peer, message);

        const promise = new Promise<Response>((accept, reject) => {
            this.ongoingCalls[id] = (incPeer, data) => {
                // don't know how this would happen with uuid4
                if (incPeer.id !== peer.id) {
                    return;
                }

                delete this.ongoingCalls[id];

                if (data.error) {
                    return reject(data.error);
                }

                return accept(data.result);
            };
        });

        return promise;
    }

    public incomingCall(peer: T, data: any) {
        if (!(data.method in this.localMethods)) {
            return this.send(peer, {id: data.id, result: null, error: "no such method"});
        }

        try {
            const ret = this.localMethods[data.method](peer, data.params);
            this.send(peer, {id: data.id, result: ret});
        } catch (err) {
            console.error(err);
            this.send(peer, {id: data.id, result: null, error: err.toString()});
        }
    }

    public incomingResponse(peer: T, data: any) {
        if (!(data.id in this.ongoingCalls)) {
            return this.send(peer, {error: "no such call id"});
        }

        this.ongoingCalls[data.id](peer, data);
    }

    public incomingNotification(peer: T, data: any) {
        this.emit(data.method, data.params);
    }

    public onMessage(peer: T, data: any) {
        if (!data) {
            return this.send(peer, {error: "no data"});
        }

        if (data.method !== undefined && data.params !== undefined) {
            if (data.id !== undefined) {
                return this.incomingCall(peer, data);
            } else {
                return this.incomingNotification(peer, data);
            }
        }

        if (data.id !== undefined) {
            return this.incomingResponse(peer, data);
        }

        if (data.error) {
            console.error(data.error);
            return;
        }

        return this.send(peer, {error: "not a call or a response"});
    }

    public abstract send(peer: T, data: any): void;
}
