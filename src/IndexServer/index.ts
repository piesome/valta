import "reflect-metadata";

import {IndexServer} from "./IndexServer";

const start = async () => {
    const server = new IndexServer();
    await server.load();
};

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
