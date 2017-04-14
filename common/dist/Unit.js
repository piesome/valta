"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Unit = (function () {
    function Unit(id, type, faction, currentHealth) {
        this.id = id;
        this.type = type;
        this.faction = faction;
        this.currentHealth = currentHealth;
    }
    Unit.deserialize = function (game, data) {
        return new Unit(data.id, game.unitTypes.getType(data.unitType), game.getFaction(data.faction), data.currentHealth);
    };
    Unit.prototype.serialize = function () {
        return {
            id: this.id,
            faction: this.faction.id,
            currentHealth: this.currentHealth,
            unitType: null
        };
    };
    return Unit;
}());
exports.Unit = Unit;
