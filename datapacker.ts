import * as fs from "fs";
import * as path from "path";

import * as R from "ramda";

const data: any = {};

function insertDir(pathParts: string[]) {
    let pos = data;
    for (const part of pathParts) {
        if (!pos[part]) {
            pos[part] = {};
        }

        pos = pos[part];
    }

    return pos;
}

function insertFile(pathParts: string[], dataToInsert: any) {
    const pos = insertDir(pathParts.slice(0, pathParts.length - 1));
    pos[pathParts[pathParts.length - 1]] = dataToInsert;
}

function walk(pathParts: string[]) {
    const curPath = pathParts.join(path.sep);

    const pathInfo = fs.lstatSync(curPath);
    if (pathInfo.isDirectory()) {
        const subs = fs.readdirSync(curPath);
        for (const sub of subs) {
            walk(R.append(sub, pathParts));
        }
        return;
    }

    try {
        let dataToInsert;
        if (curPath.endsWith(".json")) {
            const raw = fs.readFileSync(curPath, "utf8");
            dataToInsert = JSON.parse(raw);
        } else {
            const raw = fs.readFileSync(curPath);
            dataToInsert = raw.toString("base64");
        }

        insertFile(pathParts, dataToInsert);
    } catch (e) {
        console.error(e);
    }
}

function commonjs() {
    const out = `"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.data = ${JSON.stringify(data.data)};
`;

    return out;
}

walk(["data"]);
fs.writeFileSync("data.js", commonjs());
console.log("wrote data.js");
