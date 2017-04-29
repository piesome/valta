import * as React from "react";

export interface IFactionCubeParams {
    order: number;
}

export class FactionCube extends React.Component<IFactionCubeParams, object> {
    public render() {
        const hue = Math.floor(360 * ((this.props.order * 0.618033988749895) % 1));
        const style = {
            background: `hsl(${hue}, 100%, 75%)`,
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
