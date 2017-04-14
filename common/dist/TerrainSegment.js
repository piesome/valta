"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Unit_1 = require("./Unit");
var TerrainSegment = (function () {
    function TerrainSegment(id, type, x, y, z, units) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        this.units = units;
        if (x + y + z !== 0) {
            throw new Error("TerrainSegment x + y + z should equal 0");
        }
    }
    TerrainSegment.deserialize = function (game, data) {
        return new TerrainSegment(data.id, game.terrainTypes.getType(data.terrainType), data.x, data.y, data.z, data.units.map(function (x) { return Unit_1.Unit.deserialize(game, x); }));
    };
    TerrainSegment.prototype.serialize = function () {
        return {
            id: this.id,
            terrainType: this.type.name,
            x: this.x,
            y: this.y,
            z: this.z,
            units: this.units.map(function (x) { return x.serialize(); }),
            naturalResources: {},
            city: null
        };
    };
    return TerrainSegment;
}());
exports.TerrainSegment = TerrainSegment;
