import * as React from "react";

import {GameListItem} from "./GameListItem";

export interface IGameListProps {
    games: Array<{
        id: string;
        name: string;
        factionCount: number;
        status: string;
    }>;
    createGame: () => void;
    joinGame: (id: string) => void;
}

export class GameList extends React.Component<IGameListProps, undefined> {
    constructor(props: IGameListProps) {
        super(props);
    }

    public render() {
        const games = this.props.games.map((game) => {
            return (
                <GameListItem
                    id={game.id}
                    name={game.name}
                    factionCount={game.factionCount}
                    status={game.status}
                    join={this.props.joinGame}
                />
            );
        });
        return (
            <div className="game-list">
                <div className="controls">
                    <button onClick={this.props.createGame}>Create game</button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th />
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
}
