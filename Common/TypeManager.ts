import * as R from "ramda";

import {inject, injectable} from "inversify";
import {DataManager} from "./DataManager";


@injectable()
export abstract class TypeManager<T> {
    protected typeName: string;
    private types: {[name: string]: T};

    @inject(DataManager)
    private dataManager: DataManager;

    constructor() {
        this.types = {};
    }

    getType(name: string): T {
        return this.types[name];
    }


    async load(): Promise<void> {
        try {
            const rawTypes = await this.dataManager.loadTypes(this.typeName);
            for (const name in rawTypes) {
                const type = this.transformRaw(rawTypes[name]);
                this.types[name] = type;
            }
        } catch (err) {
            throw err;
        }
    }

    abstract transformRaw(data: any): T;
}
