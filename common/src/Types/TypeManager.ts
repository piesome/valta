import {data} from "valta.data";

export abstract class TypeManager<T> {
    protected typeName: string;
    protected types: {[name: string]: T};

    constructor() {
        this.types = {};
    }

    getType(name: string): T {
        const type: T = this.types[name];
        if (!type) {
            throw new Error(`No such ${this.typeName} type as ${name}`);
        }

        return type;
    }


    async load(): Promise<void> {
        try {
            console.log(`TypeManager: loading ${this.typeName}`);
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
