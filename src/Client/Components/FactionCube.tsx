import * as React from "react";

import {getHSL} from "Common/Util";

export interface IFactionCubeParams {
    order: number;
}

export class FactionCube extends React.Component<IFactionCubeParams, object> {
    public render() {
        const style = {
            background: getHSL(this.props.order),
            border: "thin solid black",
            borderRadius: "4px",
            display: "inline-block",
            height: "1rem",
            textAlign: "center",
            width: "1rem",
        };

        return (
            <span style={style}>{this.props.order}</span>
        );
    }
}
