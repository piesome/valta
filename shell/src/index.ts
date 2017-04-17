import * as readline from "readline";
import * as process from "process";

import {v4 as uuid} from "uuid";
import * as WS from "ws";
import * as yaml from "js-yaml";
import * as chalk from "chalk";

import * as RPC from "valta.common/src/RPC";


const ws = new WS(process.argv[2] || "ws://localhost:3001");

function completer(line: string) {
    const possible = RPC.SERVER_METHODS;
    const hits = possible.filter(x => x.indexOf(line) === 0);

    return [hits.length ? hits : possible, line];
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer
});

function dump(data: any) {
    const raw = yaml.dump(data);

    const lines = raw.split("\n");
    if (lines.length <= 1) {
        return raw;
    }

    return lines.map(x => `  ${x}`).join("\n") + "\n";
}

function stripError(data: string) {
    if (data.indexOf("Error: ") === 0) {
        return data.slice(7);
    }
    return data;
}

ws.on("message", (rawData) => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);

    const data = JSON.parse(rawData);

    if (data.error) {
        process.stdout.write(`${chalk.black.bgRed("Error")} ${stripError(data.error)}\n`);
    } else if (data.result !== undefined) {
        process.stdout.write(`${chalk.black.bgGreen("Response")}\n${dump(data.result)}`);
    } else if (data.params !== undefined) {
        process.stdout.write(`${chalk.black.bgYellow("Notice")} ${data.method}\n${dump(data.params)}`);
    }

    rl.prompt();
});

ws.on("close", () => {
    process.exit(0);
});

rl.prompt();

rl.on("line", (line: string) => {
    const method = line.split(" ")[0];
    const id = uuid();
    let params = {};

    try {
        params = yaml.safeLoad(line.split(" ").slice(1).join(" ")) || {};
    } catch (err) {
        console.error(err);
        return;
    }

    const toSend = JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id
    });

    ws.send(toSend);
}).on("close", () => {
    ws.close();
    process.exit(0);
});
