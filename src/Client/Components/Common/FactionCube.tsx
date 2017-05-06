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
            borderRadius: "2px",
            display: "inline-block",
            fontSize: "1.5rem",
            height: "1.5rem",
            textAlign: "center",
            width: "1.5rem",
        };

        return (
            <span style={style}>&nbsp;</span>
        );
    }
}
