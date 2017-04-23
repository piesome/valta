import * as React from "react";

export interface IGameListItemProps {
    id: string;
    name: string;
    factionCount: number;
    status: string;
    join: (id: string) => void;
}

export class GameListItem extends React.Component<IGameListItemProps, undefined> {
    constructor(props: IGameListItemProps) {
        super(props);

        this.join = this.join.bind(this);
    }

    public render() {
        return (
            <tr className="game-list-item row" key={this.props.id}>
                <td>
                    <button onClick={this.join}>Join</button>
                </td>
                <td>
                    {this.props.id}
                </td>
                <td>
                    {this.props.name}
                </td>
                <td>
                    {this.props.factionCount}
                </td>
                <td>
                    {this.props.status}
                </td>
            </tr>
        );
    }

    private join() {
        this.props.join(this.props.id);
    }
}
