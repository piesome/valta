import * as React from "react";

export interface ILobbyProps {
    lobby: {
        id: string;
        name?: string;
        canBeStarted?: boolean;
        peers?: Array<{
            id: string,
            factionType: string,
        }>
    };

    factionTypes: string[];
    ourId: string;

    onLeave: () => void;
    onSelectFaction: (factionType: string) => void;
    onStartGame: () => void;
}

export class Lobby extends React.Component<ILobbyProps, undefined> {
    constructor(props: ILobbyProps) {
        super(props);

        this.handleSelectFaction = this.handleSelectFaction.bind(this);
        this.handleStartGame = this.handleStartGame.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
    }

    public render() {
        const lobby = this.props.lobby;

        const peers = lobby.peers.map((x) => (
            <li key={x.id}>
                Peer {x.id} {x.id === this.props.ourId ? "(you)" : null} {x.factionType}
            </li>
        ));

        return (
            <div>
                <strong>Lobby {this.props.lobby.id}</strong>

                <button onClick={this.handleLeave}>Leave</button>

                <br />

                <select defaultValue="un" onChange={this.handleSelectFaction}>
                    <option value="un" disabled={true}>Select your faction</option>
                    {this.props.factionTypes.map((x) => <option key={x}>{x}</option>)}
                </select>

                <br />

                <ul>
                    {peers}
                </ul>

                {lobby.canBeStarted ? <button onClick={this.handleStartGame}>Start game</button> : null}
            </div>
        );
    }

    private handleSelectFaction(event: any) {
        this.props.onSelectFaction(event.target.value);
    }

    private handleStartGame() {
        this.props.onStartGame();
    }

    private handleLeave() {
        this.props.onLeave();
    }
}
