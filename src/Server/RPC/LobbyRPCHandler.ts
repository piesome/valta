import * as R from "ramda";

import * as RPC from "Common/RPC";
import {TerrainGenerator} from "Common/TerrainGenerator";

import {Lobby} from "../Models/Lobby";
import {RemotePeer} from "../RemotePeer";
import {registerRPC, RPCHandler} from "./RPCHandler";

export class LobbyRPCHandler extends RPCHandler {
    private lobbies: {[id: string]: Lobby};

    constructor() {
        super();

        this.lobbies = {};
    }

    private getLobby(id: string): Lobby {
        const lobby = this.lobbies[id];
        if (!lobby) {
            throw new Error("No such lobby");
        }

        return lobby;
    }

    @registerRPC(RPC.ServerMethods.ListLobbies)
    private listLobbies(
        client: RemotePeer,
        params: RPC.ServerMethods.IListLobbiesParams,
    ): RPC.ServerMethods.IListLobbiesResponse {
        return {
            lobbyIds: Object.keys(this.lobbies),
        };
    }

    @registerRPC(RPC.ServerMethods.CreateLobby)
    private createLobby(
        client: RemotePeer,
        params: RPC.ServerMethods.ICreateLobbyParams,
    ): RPC.ServerMethods.ICreateLobbyResponse {
        const lobby = new Lobby();
        this.lobbies[lobby.id] = lobby;

        lobby.on("update", () => {
            const data = lobby.serialize();
            lobby.peers.map((peer) => peer.lobbyUpdate(data));
        });

        lobby.on("canBeRemoved", () => {
            delete this.lobbies[lobby.id];
        });

        client.join(lobby);

        return {
            id: lobby.id,
        };
    }

    @registerRPC(RPC.ServerMethods.JoinLobby)
    private joinLobby(
        client: RemotePeer,
        params: RPC.ServerMethods.IJoinLobbyParams,
    ): RPC.ServerMethods.IJoinLobbyResponse {
        const lobby = this.getLobby(params.id);
        client.join(lobby);
    }

    @registerRPC(RPC.ServerMethods.SelectFaction)
    private selectFaction(
        client: RemotePeer, params: RPC.ServerMethods.ISelectFactionParams,
    ): RPC.ServerMethods.ISelectFactionResponse {
        // check that params.factionType is valid
        this.types.faction.getType(params.factionType);
        client.factionType = params.factionType;
    }

    @registerRPC(RPC.ServerMethods.LeaveLobby)
    private leaveLobby(
        client: RemotePeer,
        params: RPC.ServerMethods.ILeaveLobbyParams,
    ): RPC.ServerMethods.ILeaveLobbyResponse {
        client.assertLobby();
        client.leave();
    }
}
