import {IEffect} from "./Effect";

export class UpgradeType {
    constructor(
        public name: string,
        public dependsOn: string[],
        public automaticallyUnlocked: boolean,
        public effects: IEffect[],
    ) {}
}
