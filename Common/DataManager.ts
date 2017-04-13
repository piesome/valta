import * as path from "path";
import * as fs from "fs";

import {injectable} from "inversify";

export type RawTypes = {[name: string]: any};

/**
 * Singleton for loading data from the data/ folder
 *
 * TODO: solution compatible with the browser
 */
@injectable()
export class DataManager {
    private rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    async loadTypes(name: string): Promise<RawTypes> {
        const pathToTypes = path.join(this.rootPath, name, "types.json");

        return new Promise<RawTypes>((accept, reject) => {
            fs.readFile(pathToTypes, "utf8", (err, data) => {
                if (err) {
                    return reject(err);
                }

                try {
                    const jsonData = JSON.parse(data);
                    const transformed: {[name: string]: any} = {};

                    for (const type of jsonData) {
                        transformed[type["name"]] = type;
                    }

                    return accept(transformed);
                } catch (err) {
                    return reject(err);
                }
            });
        });
    }
}
