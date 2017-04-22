import "reflect-metadata";

import {GameRPCHandler, LobbyRPCHandler} from "./RPC";
import {Server} from "./Server";

const start = async () => {
    const server = new Server();
    server.load();

    server.addRPCHandler(new LobbyRPCHandler());
    server.addRPCHandler(new GameRPCHandler());
};

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
