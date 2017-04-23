export class FactionType {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    get isReal() {
        return this.name !== "undecided";
    }
}
