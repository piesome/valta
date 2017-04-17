import * as React from "react";

export interface LobbyListProps {
    lobbyIds: string[];
    onJoinLobby: Function;
    onCreateLobby: Function;
};

export class LobbyList extends React.Component<LobbyListProps, undefined> {
    render() {
        const lobbies = this.props.lobbyIds.map(x => {
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
