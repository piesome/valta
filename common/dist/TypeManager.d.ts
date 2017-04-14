export declare abstract class TypeManager<T> {
    protected typeName: string;
    private types;
    private dataManager;
    constructor();
    getType(name: string): T;
    load(): Promise<void>;
    abstract transformRaw(data: any): T;
}
