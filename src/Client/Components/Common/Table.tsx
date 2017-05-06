import * as React from "react";

const styles = require("./Table.scss");

export class Table extends React.Component<undefined, undefined> {
    public render() {
        return (
            <table className={styles.table}>
                {this.props.children}
            </table>
        );
    }
}
