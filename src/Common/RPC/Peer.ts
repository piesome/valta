import {EventEmitter} from "eventemitter3";
import {v4 as uuid} from "uuid";

import {ICall, RemotePeer} from "./RemotePeer";

export type RPCFn<T, Params, Response> = (client: T, params: Params) => Response;

export const RESERVED_METHOD_NAMES = ["call", "open", "close"];

export abstract class Peer<T extends RemotePeer> extends EventEmitter {
    public id: string;

    protected peers: {[id: string]: T};
    private methods: {[name: string]: RPCFn<T, any, any>};

    constructor() {
        super();

        this.id = uuid();
        this.methods = {};
        this.peers = {};
    }

    public addPeer(peer: T) {
        this.peers[peer.id] = peer;

        peer.on("call", (data: ICall) => this.onCall(peer, data));
        peer.on("close", () => this.removePeer(peer));
    }

    public removePeer(peer: T) {
        delete this.peers[peer.id];

        peer.removeListener("call");
        peer.removeListener("close");
    }

    public register<Params, Response>(name: string, method: RPCFn<T, Params, Response>) {
        this.methods[name] = method;
    }

    private onCall(peer: T, data: ICall) {
        if (data.method in RESERVED_METHOD_NAMES) {
            return peer.error(data.id, "no such method");
        }

        // notify listeners for the method. these can't return anything
        this.emit(data.method, data.params);

        if (!(data.method in this.methods)) {
            // Don't error if someone was listening at least
            if (this.listeners(data.method).length > 0) {
                return peer.respond(data.id, null);
            }

            return peer.error(data.id, `no such method ${data.method}`);
        }

        try {
            const ret = this.methods[data.method](peer, data.params);

            if (ret && typeof ret.then === "function") {
                const prom = ret as Promise<any>;
                return prom.then((promRet) => {
                    peer.respond(data.id, promRet);
                }, (err) => {
                    console.error(err);
                    peer.error(data.id, err.toString());
                });
            }

            peer.respond(data.id, ret);
        } catch (err) {
            console.error(err);
            peer.error(data.id, err.toString());
        }
    }
}
