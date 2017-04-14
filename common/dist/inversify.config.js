"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
require("reflect-metadata");
var types_1 = require("./types");
var DataManager_1 = require("./DataManager");
var FactionType_1 = require("./FactionType");
var TerrainType_1 = require("./TerrainType");
var UnitType_1 = require("./UnitType");
var Game_1 = require("./Game");
var container = new inversify_1.Container();
exports.container = container;
container.bind(types_1.TYPES.DataLoader).to(DataManager_1.DataLoader).inSingletonScope();
container.bind(types_1.TYPES.FactionTypeManager).to(FactionType_1.FactionTypeManager).inSingletonScope();
container.bind(types_1.TYPES.TerrainTypeManager).to(TerrainType_1.TerrainTypeManager).inSingletonScope();
container.bind(types_1.TYPES.UnitTypeManager).to(UnitType_1.UnitTypeManager).inSingletonScope();
container.bind(Game_1.Game).toSelf();
