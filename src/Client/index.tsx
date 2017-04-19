import * as React from "react"; // tslint:disable-line
import * as ReactDOM from "react-dom";

import {Types} from "../Common/Types";

import {App} from "./Components/App";
import {Peer} from "./Peer";

declare type LoadPercentage = (p: number) => void;

declare const loadPercentage: LoadPercentage;

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
        document.getElementById("app"),
    );
}

start();
