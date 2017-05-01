import {Game} from "../Game";
import {Faction} from "../Models";
import {Action} from "./Action";
import {Move} from "./Move";

export {Action, Move};

export class ActionManager {
    private possibleActions: {[name: string]: Action<any, any>};

    constructor(private game: Game) {
        this.possibleActions = {};

        this.addAction(new Move("move", game));
    }

    public getAction(name: string) {
        return this.possibleActions[name];
    }

    public deserialize(faction: Faction, data: any) {
        const action = this.possibleActions[data.action];
        const actor = action.deserializeActor(data.actor);
        const target = action.deserializeTarget(data.target);

        action.do(faction, actor, target);

        this.game.emit("update");
    }

    private addAction(action: Action<any, any>) {
        this.possibleActions[action.name] = action;
    }
}
