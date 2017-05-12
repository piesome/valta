import * as React from "react";

const style = require("./FlexContainer.scss");

export class FlexContainer extends React.Component<undefined, undefined> {
    public render() {
        return (
            <div className={style.controls}>
                {this.props.children}
            </div>
        );
    }
}
