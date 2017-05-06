import * as R from "ramda";
import * as React from "react";

import {Game} from "Common/Game";
import {Faction} from "Common/Models";

import {FactionCube} from "../Common/FactionCube";

const styles = require("./FactionHud.scss");

export interface IFactionHudProps {
    game: Game;
    ourId: string;
}

export class FactionHud extends React.Component<IFactionHudProps, undefined> {
    public render() {
        const renderFaction = (faction: Faction): JSX.Element => {
            return (
                <tr key={faction.id} className={styles.faction}>
                    <td>{faction.canAct ? "⇨" : null}</td>
                    <td><FactionCube order={faction.order} /></td>
                    <td>{faction.type.name}</td>
                    <td>{faction.id === this.props.ourId ? "(you)" : null}</td>
                </tr>
            );
        };

        const factions = R.map(renderFaction, R.sortBy((x) => x.order, this.props.game.factions));

        return (
            <div className={styles.factionHud}>
                <table>
                    <tbody>
                        {factions}
                    </tbody>
                </table>
            </div>
        );
    }
}
