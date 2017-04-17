import * as React from "react"; // tslint:disable-line
import * as ReactDOM from "react-dom";

import {Types} from "valta.common/src/Types";

import {Peer} from "./Peer";
import {App} from "./components/App";

declare interface LoadPercentage {
    (p: number): void;
};

declare var loadPercentage: LoadPercentage;

async function start() {
    loadPercentage(0.6);
    const peer = new Peer();
    await peer.connect();

    loadPercentage(0.8);
    const types = new Types();
    await types.load();
    loadPercentage(1);

    ReactDOM.render(
        <App peer={peer} types={types} />,
        document.getElementById("app")
    );
}

start();
