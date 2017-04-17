import * as React from "react"; // tslint:disable-line
import * as ReactDOM from "react-dom";

import {Types} from "valta.common/src/Types";

import {Peer} from "./Peer";
import {App} from "./components/App";

async function start() {
    const peer = new Peer();
    await peer.connect();

    const types = new Types();
    await types.load();

    ReactDOM.render(
        <App peer={peer} types={types} />,
        document.getElementById("app")
    );
}

start();
