import * as React from "react";

const styles = require("./Controls.scss");

export class Controls extends React.Component<undefined, undefined> {
    public render() {
        return (
            <div className={styles.controls}>
                {this.props.children}
            </div>
        );
    }
}
