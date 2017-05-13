import * as React from "react";
import {ISettings} from "../../../Common/GameState";

const style = require("./Settings.scss");

export class Settings extends React.Component<null, ISettings> {
    public render() {
        return(
            <div className={style.controls}>
                {this.props.children}
            </div>
        );
    }
}
