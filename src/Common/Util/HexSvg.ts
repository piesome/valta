import * as process from "process";

import * as program from "commander";
import * as R from "ramda";
import * as builder from "xmlbuilder";

import {Hex} from "./Hex";

program
    .option("-C, --fillColor [color]", "Fill color", R.identity, "#00d700")
    .option("-O, --fillOpacity [opacity]", "Fill opacity 0 to 1", parseFloat, 1)
    .option("-c, --strokeColor [color]", "Stroke color", R.identity, "#006c00")
    .option("-o, --strokeOpacity [opacity]", "Stroke opacity 0 to 1", parseFloat, 1)
    .option("-w, --strokeWidth [width]", "Stroke width", parseInt, 2)
    .parse(process.argv);

const hex = new Hex(0, 0);
const points = hex.corners(64 - (program.strokeWidth / 2)).map((point) => `${point.x} ${point.y}`);
const path = `M ${points[0]} L` + points.slice(1).join(" L ") + "Z";

const xml = builder.create("svg")
    .att("xmlns", "http://www.w3.org/2000/svg")
    .att("width", "128")
    .att("height", "128")
    .att("viewBox", "-64 -64 128 128")
    .ele("path")
        .att("d", path)
        .att("style", [
                `fill:${program.fillColor}`,
                `fill-opacity:${program.fillOpacity}`,
                `stroke:${program.strokeColor}`,
                `stroke-opacity:${program.strokeOpacity}`,
                `stroke-width:${program.strokeWidth}`,
            ].join(";"))
        .up();

// tslint:disable-next-line
console.log(xml.end({pretty: true}));
