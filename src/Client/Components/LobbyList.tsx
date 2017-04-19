import * as React from "react";

import {LobbyListItem} from "./LobbyListItem";

export interface ILobbyListProps {
    lobbyIds: string[];
    onJoinLobby: (id: string) => void;
    onCreateLobby: () => void;
}

export class LobbyList extends React.Component<ILobbyListProps, undefined> {
    constructor(props: ILobbyListProps) {
        super(props);
    }

    public render() {
        const lobbies = this.props.lobbyIds.map((x) => {
            return (
                <LobbyListItem
                    id={x}
                    onJoinLobby={this.props.onJoinLobby}
                />
            );
        });
        return (
            <div>
                <strong>Lobbies</strong>

                <button onClick={this.props.onCreateLobby}>Create</button>

                <ul>
                    {lobbies}
                </ul>
            </div>
        );
    }
}
