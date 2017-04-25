import * as React from "react";

import {Client} from "../Client";
import {Controls} from "./Controls";
import {GameListItem} from "./GameListItem";

const styles = require("./GameList.scss");

export interface IGameListProps {
    client: Client;
    switchToGame: () => void;
}

export interface IGameListState {
    games: Array<{
        id: string;
        name: string;
        factionCount: number;
        status: string;
    }>;
    gamesRefresh: number;
}

export class GameList extends React.Component<IGameListProps, IGameListState> {
    constructor(props: IGameListProps) {
        super(props);

        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
    }

    public componentWillMount() {
        this.setState({games: []});

        this.updateGames();
        const gamesRefresh = window.setInterval(() => {
            this.updateGames();
        }, 5000);
        this.setState({gamesRefresh});
    }

    public componentWillUnmount() {
        window.clearInterval(this.state.gamesRefresh);
    }

    public render() {
        const games = this.state.games.map((game) => {
            return (
                <GameListItem
                    key={game.id}
                    id={game.id}
                    name={game.name}
                    factionCount={game.factionCount}
                    status={game.status}
                    join={this.joinGame}
                />
            );
        });
        return (
            <div className={styles.gameList}>
                <Controls>
                    <button onClick={this.createGame}>Create game</button>
                </Controls>

                <table>
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>id</th>
                            <th>name</th>
                            <th>factionCount</th>
                            <th>status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {games}
                    </tbody>
                </table>
            </div>
        );
    }

    private async updateGames() {
        const data = await this.props.client.indexServer.listGames();
        this.setState({
            games: data.games,
        });
    }

    private async createGame() {
        const data = await this.props.client.indexServer.createGame();
        await this.props.client.connectToGame(data.url);
        this.props.switchToGame();
    }

    private async joinGame(id: string) {
        const data = await this.props.client.indexServer.joinGame(id);
        await this.props.client.connectToGame(data.url);
        this.props.switchToGame();
    }
}
