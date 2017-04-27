import {Effect} from "./Effect";

export class UpgradeType {
    constructor(
        public name: string,
        public dependsOn: string[],
        public automaticallyUnlocked: boolean,
        public effects: Effect[],
    ) {}
}
