"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var TypeManager_1 = require("./TypeManager");
var TerrainType = (function () {
    function TerrainType(name, movementPenalty) {
        this.name = name;
        this.movementPenalty = movementPenalty;
    }
    return TerrainType;
}());
exports.TerrainType = TerrainType;
/**
 * Singleton for managing TerrainType
 */
var TerrainTypeManager = (function (_super) {
    __extends(TerrainTypeManager, _super);
    function TerrainTypeManager() {
        var _this = _super.call(this) || this;
        _this.typeName = "terrain";
        return _this;
    }
    TerrainTypeManager.prototype.transformRaw = function (data) {
        return new TerrainType(data.name, data.movementPenalty);
    };
    return TerrainTypeManager;
}(TypeManager_1.TypeManager));
TerrainTypeManager = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], TerrainTypeManager);
exports.TerrainTypeManager = TerrainTypeManager;
