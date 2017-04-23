import "reflect-metadata";

import {GameServer} from "./GameServer";

const start = async () => {
    const server = new GameServer();
    await server.load();
};

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
