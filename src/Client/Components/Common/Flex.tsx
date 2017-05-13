import * as React from "react";

const styles = require("./Flex.scss");

export class Flex extends React.Component<undefined, undefined> {
    public render() {
        return (
            <div className={styles.flex}>
                {this.props.children}
            </div>
        );
    }
}
