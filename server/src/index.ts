import * as EE from "events";

import * as WS from "ws";
import {v4 as uuid} from "uuid";
import * as R from "ramda";

import {Game} from "valta.common/src/Game";
import {Types} from "valta.common/src/Types";
import {Faction} from "valta.common/src/Models";
import * as RPC from "valta.common/src/RPC";
import {TerrainGenerator} from "valta.common/src/TerrainGenerator";

class ServerGame extends Game {
    public clients: RemotePeer[];

    constructor(types: Types) {
        super(types);
        this.clients = [];
    }

    public clientsFaction(peer: RemotePeer, faction: Faction) {
        this.clients.push(peer);
        this.addFaction(faction);
        peer.faction = faction;
        peer.game = this;
    }
}

class LobbyUser {
    public factionType: string;

    constructor(
        public peer: RemotePeer
    ) {}

    serialize() {
        return {
            factionType: this.factionType
        };
    }
}

class Lobby extends EE {
    public lobbyUsers: LobbyUser[];
    public name: string;
    public id: string;

    constructor() {
        super();

        this.id = uuid();
        this.name = "unnamed";
        this.lobbyUsers = [];
    }

    addPeer(peer: RemotePeer) {
        peer.assertNotInLobby();

        const lobbyUser = new LobbyUser(peer);
        this.lobbyUsers.push(lobbyUser);

        peer.lobby = this;
        peer.lobbyUser = lobbyUser;

        this.emit("update");
    }

    removePeer(peer: RemotePeer) {
        this.lobbyUsers = R.filter(x => x.peer.id !== peer.id, this.lobbyUsers);

        peer.lobby = null;
        peer.lobbyUser = null;

        this.emit("update");
    }

    canBeStarted() {
        return this.lobbyUsers.length >= 2 && R.all(x => !!x.factionType, this.lobbyUsers);
    }

    canBeRemoved() {
        return this.lobbyUsers.length === 0;
    }

    start(types: Types): ServerGame {
        const game = new ServerGame(types);
        (new TerrainGenerator(game, 3)).generate();

        let canAct = true;

        for (const lobbyUser of this.lobbyUsers) {
            const faction = new Faction(
                uuid(),
                types.faction.getType(lobbyUser.factionType),
                canAct,
                types.upgrade.automaticallyUnlocked()
            );

            game.clientsFaction(lobbyUser.peer, faction);
            canAct = false;

            lobbyUser.peer.lobby = null;
            lobbyUser.peer.lobbyUser = null;
        }

        this.lobbyUsers = [];

        return game;
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            lobbyUsers: this.lobbyUsers.map(x => x.serialize()),
            canBeStarted: this.canBeStarted()
        };
    }
}

class RemotePeer extends RPC.RemotePeer {
    public ws: WS;
    public lobby: Lobby;
    public lobbyUser: LobbyUser;
    public game: Game;
    public faction: Faction;

    constructor(id: string, ws: WS) {
        super(id);
        this.ws = ws;
    }

    assertGame() {
        if (!this.game) {
            throw new Error("Client hasn't joined a game");
        }
    }

    assertFaction() {
        if (!this.faction) {
            throw new Error("Client hasn't created a faction");
        }
    }

    assertLobby() {
        if (!this.lobby) {
            throw new Error("Client hasn't joined a lobby");
        }
    }

    assertNotInLobby() {
        if (this.lobby) {
            throw new Error("Client is in a lobby");
        }
    }
}

class Server extends RPC.Peer<RemotePeer> {
    private wss: WS.Server;

    constructor() {
        super(uuid());

        this.wss = new WS.Server({
            perMessageDeflate: false,
            port: 3001
        });

        this.wss.on("connection", x => this.onConnection(x));
    }

    send(peer: RemotePeer, data: any) {
        data.jsonrpc = "2.0";
        const json = JSON.stringify(data);
        peer.ws.send(json);
    }

    private onConnection(ws: WS) {
        const id = uuid();
        const peer = new RemotePeer(id, ws);
        this.addPeer(peer);

        ws.on("close", () => this.removePeer(peer));
        ws.on("message", (data) => {
            try {
                const json = JSON.parse(data);
                this.onMessage(peer, json);
            } catch (e) {}
        });
    }
}

class GameManager {
    private lobbies: {[id: string]: Lobby};
    private games: {[id: string]: Game};
    private types: Types;
    private peer: RPC.Peer<RemotePeer>;

    constructor() {
        this.games = {};
        this.lobbies = {};

        this.types = new Types();
    }

    async load() {
        try {
            await this.types.load();
        } catch (err) {
            throw err;
        }
    }

    getGame(gameid: string): Game {
        const game = this.games[gameid];

        if (!game) {
            throw new Error("No such game");
        }

        return game;
    }

    getLobby(id: string): Lobby {
        const lobby = this.lobbies[id];
        if (!lobby) {
            throw new Error("No such lobby");
        }

        return lobby;
    }

    listLobbies(client: RemotePeer, params: RPC.ListLobbies.Params): RPC.ListLobbies.Response {
        return {
            lobbies: Object.keys(this.lobbies)
        };
    }

    createLobby(client: RemotePeer, params: RPC.CreateLobby.Params): RPC.CreateLobby.Response {
        client.assertNotInLobby();

        const lobby = new Lobby();
        this.lobbies[lobby.id] = lobby;

        lobby.on("update", () => {
            const data = lobby.serialize();
            lobby.lobbyUsers.map(x => this.peer.notifyPeer(x.peer, RPC.LobbyUpdate.name, data));
        });

        lobby.addPeer(client);

        return {
            lobby: lobby.id
        };
    }

    joinLobby(client: RemotePeer, params: RPC.JoinLobby.Params): RPC.JoinLobby.Response {
        client.assertNotInLobby();
        const lobby = this.getLobby(params.lobby);
        lobby.addPeer(client);

        return {
            lobby: lobby.id
        };
    }

    selectFaction(client: RemotePeer, params: RPC.SelectFaction.Params): RPC.SelectFaction.Response {
        // check that params.factionType is valid
        this.types.faction.getType(params.factionType);

        client.assertLobby();
        client.lobbyUser.factionType = params.factionType;
        client.lobby.emit("update");

        return {};
    }

    leaveLobby(client: RemotePeer, params: RPC.LeaveLobby.Params): RPC.LeaveLobby.Response {
        client.assertLobby();
        const lobby = client.lobby;

        lobby.removePeer(client);

        if (lobby.canBeRemoved()) {
            delete this.lobbies[lobby.id];
        }

        return {};
    }

    startGame(client: RemotePeer, params: RPC.StartGame.Params): RPC.StartGame.Response {
        client.assertLobby();
        const lobby = client.lobby;

        if (!lobby.canBeStarted()) {
            throw new Error("Not all players have selected their faction yet");
        }

        const game = lobby.start(this.types);

        delete this.lobbies[lobby.id];

        game.on("update", () => {
            const data = game.serialize();
            game.clients.map(x => this.peer.notifyPeer(x, RPC.GameUpdate.name, data));
        });

        game.clients.map(x => this.peer.notifyPeer(x, RPC.GameStarted.name, x.faction.serialize()));

        return {};
    }

    getGameState(client: RemotePeer, params: RPC.GetGameState.Params): RPC.GetGameState.Response {
        client.assertGame();

        return {
            gameState: client.game.serialize()
        };
    }

    register(peer: RPC.Peer<RemotePeer>) {
        this.peer = peer;

        // lobby

        peer.register<RPC.ListLobbies.Params, RPC.ListLobbies.Response>(
            RPC.ListLobbies.name,
            (client, data) => this.listLobbies(client, data)
        );

        peer.register<RPC.CreateLobby.Params, RPC.CreateLobby.Response>(
            RPC.CreateLobby.name,
            (client, data) => this.createLobby(client, data)
        );

        peer.register<RPC.JoinLobby.Params, RPC.JoinLobby.Response>(
            RPC.JoinLobby.name,
            (client, data) => this.joinLobby(client, data)
        );

        peer.register<RPC.SelectFaction.Params, RPC.SelectFaction.Response>(
            RPC.SelectFaction.name,
            (client, data) => this.selectFaction(client, data)
        );

        peer.register<RPC.LeaveLobby.Params, RPC.LeaveLobby.Response>(
            RPC.LeaveLobby.name,
            (client, data) => this.leaveLobby(client, data)
        );

        // game

        peer.register<RPC.StartGame.Params, RPC.StartGame.Response>(
            RPC.StartGame.name,
            (client, data) => this.startGame(client, data)
        );

        peer.register<RPC.GetGameState.Params, RPC.GetGameState.Response>(
            RPC.GetGameState.name,
            (client, data) => this.getGameState(client, data)
        );
    }
}

const server = new Server();
const gameManager = new GameManager();
gameManager.register(server);

gameManager.load()
    .then(() => {
        console.log("GameManager: loaded");
    }, (err) => {
        console.error(err);
        process.exit(1);
    });
