"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var inversify_config_1 = require("./inversify.config");
var Game_1 = require("./Game");
var game = inversify_config_1.container.get(Game_1.Game);
game.load()
    .then(function () {
    var serialized = game.serialize();
    game.deserialize(serialized);
    var reserialized = game.serialize();
    chai_1.expect(serialized).to.deep.equal(reserialized);
    console.log(serialized);
})
    .catch(function (err) {
    console.error(err);
});
