import * as React from "react";

import {Game} from "Common/Game";
import * as RPC from "Common/RPC";
import {Types} from "Common/Types";

import {Client} from "../Client";
import {GameComponent} from "./Game";
import {GameList} from "./GameList";

require("./App.scss");

export interface IAppProps {
    client: Client;
    types: Types;
}

export type AppState = "GameList" | "Game";

export interface IAppState {
    appState: AppState;
}

export class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);

        this.switchToGame = this.switchToGame.bind(this);
        this.switchToGameList = this.switchToGameList.bind(this);
    }

    public componentWillMount() {
        this.setState({appState: "GameList"});
    }

    public render() {
        if (this.state.appState === "Game") {
            return (
                <GameComponent
                    client={this.props.client}
                    types={this.props.types}
                    switchToGameList={this.switchToGameList}
                />
            );
        } else if (this.state.appState === "GameList") {
            return (
                <GameList
                    client={this.props.client}
                    switchToGame={this.switchToGame}
                />
            );
        }
    }

    private switchToGame() {
        this.setState({appState: "Game"});
    }

    private switchToGameList() {
        this.setState({appState: "GameList"});
    }
}
