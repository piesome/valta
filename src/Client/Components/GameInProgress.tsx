import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction} from "Common/Models";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Client} from "../Client";
import {Controls} from "./Controls";

export interface IGameInProgressProps {
    client: Client;
    types: Types;
    game: Game;
    switchToGameList: () => void;
}

export class GameInProgress extends React.Component<IGameInProgressProps, void> {
    constructor(props: IGameInProgressProps) {
        super(props);
    }

    public render() {
        return (
            <div />
        );
    }
}
