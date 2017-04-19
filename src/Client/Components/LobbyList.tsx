import * as React from "react";

export interface ILobbyListProps {
    lobbyIds: string[];
    onJoinLobby: (id: string) => void;
    onCreateLobby: () => void;
}

export class LobbyList extends React.Component<ILobbyListProps, undefined> {
    public render() {
        const lobbies = this.props.lobbyIds.map((x) => {
            return (
                <li key={x} onClick={() => this.props.onJoinLobby(x)}>
                    {x}
                </li>
            );
        });
        return (
            <div>
                <strong>Lobbies</strong>

                <button onClick={() => this.props.onCreateLobby()}>Create</button>

                <ul>
                    {lobbies}
                </ul>
            </div>
        );
    }
}
