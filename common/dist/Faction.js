"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Faction = (function () {
    function Faction(id, type, canAct) {
        this.id = id;
        this.type = type;
        this.canAct = canAct;
    }
    Faction.deserialize = function (game, data) {
        return new Faction(data.id, game.factionTypes.getType(data.factionType), data.canAct);
    };
    Faction.prototype.serialize = function () {
        console.log(this.type);
        return {
            id: this.id,
            factionType: this.type.name,
            canAct: this.canAct,
            unlockedTechnologies: []
        };
    };
    return Faction;
}());
exports.Faction = Faction;
