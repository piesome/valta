import {Peer} from "./Peer";
import {RemotePeer} from "./RemotePeer";

import * as ClientMethods from "./ClientMethods";
import * as GameServerMethods from "./GameServerMethods";
import * as IndexServerMethods from "./IndexServerMethods";

export {
    Peer,
    RemotePeer,
    ClientMethods,
    GameServerMethods,
    IndexServerMethods,
};

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

export function registerRPCs(obj: Peer<any>) {
    const rpcs: IRPC[] = Reflect.getMetadata(RPC_METADATA_KEY, obj) || [];
    for (const rpc of rpcs) {
        obj.register(rpc.method, rpc.fn.bind(obj));
    }
}
