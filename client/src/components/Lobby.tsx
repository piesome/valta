import * as React from "react";

export interface LobbyProps {
    lobby: {
        id: string;
        name?: string;
        canBeStarted?: boolean;
        peers?: {
            id: string,
            factionType: string
        }[]
    };

    factionTypes: string[];
    ourId: string;

    onLeave: Function;
    onSelectFaction: Function;
    onStartGame: Function;
}

export class Lobby extends React.Component<LobbyProps, undefined> {
    handleSelectFaction(event: any) {
        this.props.onSelectFaction(event.target.value);
    }

    render() {
        const lobby = this.props.lobby;

        const peers = lobby.peers.map(x => (
            <li key={x.id}>
                Peer {x.id} {x.id === this.props.ourId ? "(you)" : null} {x.factionType}
            </li>
        ));

        return (
            <div>
                <strong>Lobby {this.props.lobby.id}</strong>

                <button onClick={() => this.props.onLeave()}>Leave</button>

                <br />

                <select defaultValue="un" onChange={(e) => this.handleSelectFaction(e)}>
                    <option value="un" disabled>Select your faction</option>
                    {this.props.factionTypes.map(x => <option key={x}>{x}</option>)}
                </select>

                <br />

                <ul>
                    {peers}
                </ul>
                
                {lobby.canBeStarted ? <button onClick={() => this.props.onStartGame()}>Start game</button> : null}
            </div>
        );
    }
}
