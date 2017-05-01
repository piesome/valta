import {Game} from "../Game";
import {Faction} from "../Models";

export interface IActorable {
    currentEnergy: number;
    faction: Faction;
}

export abstract class Action<Actor extends IActorable, Target> {
    constructor(
        public name: string,
        protected game: Game,
    ) {}

    public do(faction: Faction, actor: Actor, target: Target) {
        if (actor.faction.id !== faction.id) {
            throw new Error("Can't act on other factions actors");
        }

        if (!faction.canAct) {
            throw new Error("Can't act");
        }

        const energyConsumption = this.energyConsumption(actor, target);
        if (actor.currentEnergy < energyConsumption) {
            throw new Error("Just can't");
        }

        this.enact(actor, target);
        actor.currentEnergy -= energyConsumption;
    }

    public abstract enact(actor: Actor, target: Target): void;
    public abstract energyConsumption(actor: Actor, target: Target): number;
    public abstract range(actor: Actor): number;

    public serialize(actor: Actor, target: Target) {
        return {
            action: this.name,
            actor: this.serializeActor(actor),
            target: this.serializeTarget(target),
        };
    }

    public abstract serializeActor(actor: Actor): any;
    public abstract serializeTarget(target: Target): any;

    public abstract deserializeActor(data: any): Actor;
    public abstract deserializeTarget(data: any): Target;
}
