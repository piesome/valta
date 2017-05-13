import * as React from "react";

const style = require("./Settings.scss");

export class Settings extends React.Component<null, null> {
    public render() {
        return(
            <div className={style.controls}>
                {this.props.children}
            </div>
        );
    }
}
