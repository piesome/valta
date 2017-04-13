import * as R from "ramda";

import {inject, injectable} from "inversify";
import {DataManager} from "./DataManager";


export interface TypeManager<T> {
    load(): Promise<void>;
    getType(name: string): T;
}
