import {v4 as uuid} from "uuid";

import * as GS from "./GameState";

export interface RPC<Params, Response> {
    (client: string, params: Params): Response;
}

export namespace ListGames {
    export const name = "ListGames";
    export interface Params {}
    export interface Response {
        games: GS.ID[];
    }
}

export namespace CreateGame {
    export const name = "CreateGame";
    export interface Params {}
    export interface Response {
        game: GS.ID;
    }
}

export namespace JoinGame {
    export const name = "JoinGame";
    export interface Params {
        game: GS.ID;
        factionType: GS.FactionType;
    }
    export interface Response {
        faction: GS.ID;
    }
}

export namespace GetGameState {
    export const name = "GetGameState";
    export interface Params {
        game: GS.ID;
    }
    export interface Response {
        gameState: GS.GameState;
    }
}

export interface RPCPeerCB {
    (peer: RemoteRPCPeer, data: any): void;
}

export abstract class RemoteRPCPeer {
    constructor(
        public id: string,
    ) {}
}

export abstract class RPCPeer {
    private localMethods: {[name: string]: RPC<any, any>};
    private ongoingCalls: {[id: string]: RPCPeerCB};
    private peers: {[id: string]: RemoteRPCPeer};

    constructor(
        private id: string
    ) {
        this.localMethods = {};
        this.peers = {};
    }

    addPeer(peer: RemoteRPCPeer) {
        this.peers[peer.id] = peer;
    }

    removePeer(peer: RemoteRPCPeer) {
        delete this.peers[peer.id];
    }

    register<Params, Response>(name: string, method: RPC<Params, Response>) {
        this.localMethods[name] = method;
    }

    callPeer<Response>(peer: RemoteRPCPeer, method: string, params: any): Promise<Response> {
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

    incomingCall(peer: RemoteRPCPeer, data: any) {
        if (!(data.method in this.localMethods)) {
            return this.send(peer, {id: data.id, result: null, error: "no such method"});
        }

        try {
            const ret = this.localMethods[data.method](peer.id, data.params);
            this.send(peer, {id: data.id, result: ret});
        } catch (err) {
            this.send(peer, {id: data.id, result: null, error: err.toString()});
        }
    }

    incomingResponse(peer: RemoteRPCPeer, data: any) {
        if (!(data.id in this.ongoingCalls)) {
            return this.send(peer, {error: "no such call id"});
        }

        this.ongoingCalls[data.id](peer, data);
    }

    onMessage(peer: RemoteRPCPeer, data: any) {
        if (!data) {
            return this.send(peer, {error: "no data"});
        }

        if (data.method !== undefined && data.params !== undefined) {
            return this.incomingCall(peer, data);
        }

        if (data.response !== undefined && data.id !== undefined) {
            return this.incomingResponse(peer, data);
        }

        return this.send(peer, {error: "no't a call or a response"});
    }

    abstract send(peer: RemoteRPCPeer, data: any): void;
}
