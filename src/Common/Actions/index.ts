import {Game} from "../Game";
import {Faction} from "../Models";
import {Action} from "./Action";
import {Attack} from "./Attack";
import {Move} from "./Move";
import {Settle} from "./Settle";

export {Action, Attack, Move};

export class ActionManager {
    private possibleActions: {[name: string]: Action<any>};

    constructor(private game: Game) {
        this.possibleActions = {};

        this.addAction(new Move(game));
        this.addAction(new Attack(game));
        this.addAction(new Settle(game));
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

    private addAction(action: Action<any>) {
        this.possibleActions[action.name] = action;
    }
}
