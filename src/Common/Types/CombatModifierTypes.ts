import {CombatModifierType, TypeManager} from ".";

export class CombatModifierTypes extends TypeManager<CombatModifierType> {
    constructor() {
        super();
        this.typeName = "combatmodifier";
    }

    public transformRaw(data: any): CombatModifierType {
        return new CombatModifierType(
            data.target,
            data.modifier,
        );
    }
}
