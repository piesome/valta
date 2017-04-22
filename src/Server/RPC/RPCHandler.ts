import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {RemotePeer} from "../RemotePeer";

const RPC_METADATA_KEY = "rpc";

interface IRPC {
    method: string;
    fn: (client: RemotePeer, data: any) => any;
}

export function registerRPC(method: string) {
    return (target: any, propertyName: string, descriptor: any) => {
        const rpcs: IRPC[] = Reflect.getMetadata(RPC_METADATA_KEY, target) || [];
        rpcs.push({
            method,
            fn: target[propertyName],
        });
        Reflect.defineMetadata(RPC_METADATA_KEY, rpcs, target);

        return descriptor;
    };
}

export abstract class RPCHandler {
    protected types: Types;

    public register(peer: RPC.Peer<RemotePeer>, types: Types) {
        this.types = types;

        const rpcs: IRPC[] = Reflect.getMetadata(RPC_METADATA_KEY, this) || [];
        for (const rpc of rpcs) {
            peer.register(rpc.method, rpc.fn.bind(this));
        }
    }
}
