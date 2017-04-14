"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var uuid_1 = require("uuid");
var types_1 = require("./types");
var FactionType_1 = require("./FactionType");
var TerrainType_1 = require("./TerrainType");
var UnitType_1 = require("./UnitType");
var TerrainSegment_1 = require("./TerrainSegment");
var Faction_1 = require("./Faction");
var Game = (function () {
    function Game() {
        this.terrain = [];
    }
    Game.prototype.getFaction = function (id) {
        return this.factions.filter(function (x) { return x.id === id; })[0];
    };
    Game.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.factionTypes.load()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.terrainTypes.load()];
                    case 2:
                        _a.sent();
                        this.generateRandomTerrain();
                        this.factions = [
                            new Faction_1.Faction(uuid_1.v4(), this.factionTypes.getType("faction-1"), true),
                            new Faction_1.Faction(uuid_1.v4(), this.factionTypes.getType("faction-2"), true)
                        ];
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.deserialize = function (data) {
        var _this = this;
        this.factions = data.factions.map(function (x) { return Faction_1.Faction.deserialize(_this, x); });
        this.deserializeTerrain(data.terrain);
    };
    Game.prototype.serialize = function () {
        return {
            factions: this.factions.map(function (x) { return x.serialize(); }),
            terrain: this.serializeTerrain()
        };
    };
    Game.prototype.addTerrain = function (terrain) {
        if (!this.terrain[terrain.x]) {
            this.terrain[terrain.x] = [];
        }
        if (!this.terrain[terrain.x][terrain.y]) {
            this.terrain[terrain.x][terrain.y] = [];
        }
        this.terrain[terrain.x][terrain.y][terrain.z] = terrain;
    };
    Game.prototype.generateRandomTerrain = function () {
        var n = 3;
        for (var dx = -n; dx <= n; dx++) {
            for (var dy = Math.max(-n, -dx - n); dy <= Math.min(n, -dx + n); dy++) {
                var dz = -dx - dy;
                var terrain = new TerrainSegment_1.TerrainSegment(uuid_1.v4(), this.terrainTypes.getType("plains"), dx, dy, dz, []);
                this.addTerrain(terrain);
            }
        }
    };
    Game.prototype.serializeTerrain = function () {
        var terrain = [];
        for (var xkey in this.terrain) {
            terrain[xkey] = [];
            for (var ykey in this.terrain[xkey]) {
                terrain[xkey][ykey] = [];
                for (var zkey in this.terrain[xkey][ykey]) {
                    terrain[xkey][ykey][zkey] = this.terrain[xkey][ykey][zkey].serialize();
                }
            }
        }
        return terrain;
    };
    Game.prototype.deserializeTerrain = function (data) {
        this.terrain = [];
        for (var xkey in data) {
            for (var ykey in data[xkey]) {
                for (var zkey in data[xkey][ykey]) {
                    var terrain = TerrainSegment_1.TerrainSegment.deserialize(this, data[xkey][ykey][zkey]);
                    this.addTerrain(terrain);
                }
            }
        }
    };
    return Game;
}());
__decorate([
    inversify_1.inject(types_1.TYPES.FactionTypeManager),
    __metadata("design:type", FactionType_1.FactionTypeManager)
], Game.prototype, "factionTypes", void 0);
__decorate([
    inversify_1.inject(types_1.TYPES.TerrainTypeManager),
    __metadata("design:type", TerrainType_1.TerrainTypeManager)
], Game.prototype, "terrainTypes", void 0);
__decorate([
    inversify_1.inject(types_1.TYPES.UnitTypeManager),
    __metadata("design:type", UnitType_1.UnitTypeManager)
], Game.prototype, "unitTypes", void 0);
Game = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], Game);
exports.Game = Game;
