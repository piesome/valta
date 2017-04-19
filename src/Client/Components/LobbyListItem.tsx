import * as React from "react";

export interface ILobbyListItemProps {
    id: string;

    onJoinLobby: (id: string) => void;
}

export class LobbyListItem extends React.Component<ILobbyListItemProps, undefined> {
    constructor(props: ILobbyListItemProps) {
        super(props);

        this.handleSelectLobby = this.handleSelectLobby.bind(this);
    }

    public render() {
        return (
            <li key={this.props.id} onClick={this.handleSelectLobby}>{this.props.id}</li>
        );
    }

    private handleSelectLobby() {
        this.props.onJoinLobby(this.props.id);
    }
}
