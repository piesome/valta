import {Game} from "../Game";
import {Faction, TerrainSegment} from "../Models";

/**
 * IActorable = unit for now, in future city too
 */
export interface IActorable {
    currentEnergy: number;
    faction: Faction;
    id: string;
}

export abstract class Action<Actor extends IActorable> {
    constructor(
        public name: string,
        protected game: Game,
    ) {}

    public do(faction: Faction, actor: Actor, target: TerrainSegment) {
        if (actor.faction.id !== faction.id) {
            throw new Error("Can't act on other factions actors");
        }

        if (!faction.canAct) {
            throw new Error("Can't act");
        }

        const energyConsumption = this.energyConsumption(actor, target);
        if (actor.currentEnergy < energyConsumption) {
            throw new Error(`Not enough energy. Actor has ${actor.currentEnergy} but needs ${energyConsumption}`);
        }

        this.enact(actor, target);
        actor.currentEnergy -= energyConsumption;
    }

    public abstract enact(actor: Actor, target: TerrainSegment): void;
    public abstract energyConsumption(actor: Actor, target: TerrainSegment): number;
    public abstract range(actor: Actor): number;

    public serialize(actor: Actor, target: TerrainSegment) {
        return {
            action: this.name,
            actor: this.serializeActor(actor),
            target: this.serializeTarget(target),
        };
    }

    public serializeActor(actor: Actor) {
        return actor.id;
    }

    public serializeTarget(target: TerrainSegment) {
        return target.id;
    }

    public abstract deserializeActor(data: any): Actor;

    public deserializeTarget(data: any) {
        return this.game.getTerrain(data);
    }
}
