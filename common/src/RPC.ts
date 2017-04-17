import * as EE from "events";

import {v4 as uuid} from "uuid";

import * as GS from "./GameState";

export interface RPC<T, Params, Response> {
    (client: T, params: Params): Response;
}

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
    export type Response = GS.GameState;
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
    ListLobbies.name
];

export namespace LobbyUpdate {
    export const name = "LobbyUpdate";
    export interface Params {
        id: GS.ID;
        name: string;
        peers: {
            id: GS.ID,
            factionType: string
        }[];
        canBeStarted: boolean;
    }
}

export namespace GameUpdate {
    export const name = "GameUpdate";
    export type Params = GS.GameState;
}

export namespace GameStarted {
    export const name = "GameStarted";
    export interface Params {
        gameState: GS.GameState;
        faction: GS.Faction;
    }
}

export namespace AdjustIds {
    export const name = "AdjustIds";
    export interface Params {
        youAre: GS.ID;
        iAm: GS.ID;
    }
}

export interface RPCPeerCB<T> {
    (peer: T, data: any): void;
}

export abstract class RemotePeer extends EE {
    constructor(
        public id: string,
    ) {
        super();
    }
}

export abstract class Peer<T extends RemotePeer> extends EE {
    private localMethods: {[name: string]: RPC<T, any, any>};
    private ongoingCalls: {[id: string]: RPCPeerCB<T>};
    private peers: {[id: string]: T};

    constructor(
        public id: string
    ) {
        super();
        this.localMethods = {};
        this.peers = {};
        this.ongoingCalls = {};
    }

    addPeer(peer: T) {
        this.peers[peer.id] = peer;
    }

    removePeer(peer: T) {
        delete this.peers[peer.id];
    }

    register<Params, Response>(name: string, method: RPC<T, Params, Response>) {
        this.localMethods[name] = method;
    }

    notifyPeer(peer: T, method: string, params: any) {
        const message = {
            method,
            params
        };
        this.send(peer, message);
    }

    callPeer<Response>(peer: T, method: string, params: any): Promise<Response> {
        const id = uuid();

        const message = {
            method,
            params,
            id
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

    incomingCall(peer: T, data: any) {
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

    incomingResponse(peer: T, data: any) {
        if (!(data.id in this.ongoingCalls)) {
            return this.send(peer, {error: "no such call id"});
        }

        this.ongoingCalls[data.id](peer, data);
    }

    incomingNotification(peer: T, data: any) {
        this.emit(data.method, data.params);
    }

    onMessage(peer: T, data: any) {
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

    abstract send(peer: T, data: any): void;
}
