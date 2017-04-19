import {data} from "../../../data";

export abstract class TypeManager<T> {
    protected typeName: string;
    protected types: {[name: string]: T};

    constructor() {
        this.types = {};
    }

    public getType(name: string): T {
        const type: T = this.types[name];
        if (!type) {
            throw new Error(`No such ${this.typeName} type as ${name}`);
        }

        return type;
    }

    public async load(): Promise<void> {
        try {
            const rawTypes = data[this.typeName]["types.json"];
            for (const raw of rawTypes) {
                this.types[raw.name] = this.transformRaw(raw);
            }
        } catch (err) {
            throw err;
        }
    }

    public abstract transformRaw(data: any): T;
}
