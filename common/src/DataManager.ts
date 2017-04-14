import {injectable} from "inversify";

import {data} from "./data";

@injectable()
export class DataLoader {

    constructor() {}

    async loadTypes(name: string): Promise<any[]> {
        return Promise.resolve(data[name]["types.json"]);
    }
}
