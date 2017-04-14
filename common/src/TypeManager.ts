import {inject, injectable} from "inversify";

import {TYPES} from "./types";
import {DataLoader} from "./DataManager";


@injectable()
export abstract class TypeManager<T> {
    protected typeName: string;
    private types: {[name: string]: T};

    @inject(TYPES.DataLoader)
    private dataManager: DataLoader;

    constructor() {
        this.types = {};
    }

    getType(name: string): T {
        return this.types[name];
    }


    async load(): Promise<void> {
        try {
            const rawTypes = await this.dataManager.loadTypes(this.typeName);
            for (const raw of rawTypes) {
                this.types[raw.name] = this.transformRaw(raw);
            }
        } catch (err) {
            throw err;
        }
    }

    abstract transformRaw(data: any): T;
}
