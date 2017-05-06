import * as React from "react";

import {Game} from "Common/Game";

const styles = require("./EndTurnHud.scss");

export interface IEndTurnHudProps {
    game: Game;
    ourId: string;
    endTurn: () => void;
}

export class EndTurnHud extends React.Component<IEndTurnHudProps, undefined> {
    public render() {
        const disabled = !(this.props.game.getFaction(this.props.ourId).canAct);

        if (disabled) {
            return null;
        }

        return (
            <div className={styles.endTurnHud}>
                <button onClick={this.props.endTurn}>End turn</button>
            </div>
        );
    }
}
