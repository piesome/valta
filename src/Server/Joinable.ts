import {RemotePeer} from "./RemotePeer";

export interface Joinable {
    type: string;
    peers: RemotePeer[];

    addPeer(peer: RemotePeer): void;
    removePeer(peer: RemotePeer): void;
}
