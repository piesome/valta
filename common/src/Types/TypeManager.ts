import {data} from "../data";

export abstract class TypeManager<T> {
    protected typeName: string;
    private types: {[name: string]: T};

    constructor() {
        this.types = {};
    }

    getType(name: string): T {
        return this.types[name];
    }


    async load(): Promise<void> {
        try {
            const rawTypes = data[this.typeName]["types.json"];
            for (const raw of rawTypes) {
                this.types[raw.name] = this.transformRaw(raw);
            }
        } catch (err) {
            throw err;
        }
    }

    abstract transformRaw(data: any): T;
}
