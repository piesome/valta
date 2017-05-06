import * as React from "react";

import {Game} from "Common/Game";

const styles = require("./SelectHud.scss");

export class SelectHud extends React.Component<undefined, undefined> {
    public render() {
        return (
            <div className={styles.selectHud}>
                {this.props.children}
            </div>
        );
    }
}
