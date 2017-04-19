import {Improvement} from "./Improvement";

export class UpgradeType {
    constructor(
        public name: string,
        public dependsOn: string[],
        public automaticallyUnlocked: boolean,
        public improvements: Improvement[],
    ) {}
}
