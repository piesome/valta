import {Game} from "./Game";
import {Hex} from "./Util";

export interface ITerrainGenerator {
    generate(): Hex[];
}
