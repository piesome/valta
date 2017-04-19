import {RemotePeer} from "./RemotePeer";

export interface IJoinable {
    type: string;
    peers: RemotePeer[];

    addPeer(peer: RemotePeer): void;
    removePeer(peer: RemotePeer): void;
}
