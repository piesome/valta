import * as debug from "debug";

import {Game} from "../Game";
import {TerrainSegment, Unit} from "../Models";
import {Hex} from "../Util";
import {Action} from "./Action";

const log = debug("valta:Move");

export class Move extends Action<Unit> {
    public range(unit: Unit): number {
        return unit.currentEnergy;
    }

    public energyConsumption(unit: Unit, terrain: TerrainSegment) {
        return this.getMoves(unit, terrain).length;
    }

    public enact(unit: Unit, terrain: TerrainSegment) {
        this.game.moveUnitTo(unit, terrain);
    }

    public deserializeActor(data: any) {
        return this.game.getUnit(data as string);
    }

    private getMoves(unit: Unit, target: TerrainSegment): Hex[] {
        // #algorithmcoding #clearvariablenames #commentedcode
        const {r, q} = unit.terrain;
        log(`Calculating a path from (q: ${q},r: ${r}) to (q: ${target.q},r: ${target.r})`);
        const visited: { [r: number]: { [q: number]: Hex } } = {};
        visited[r] = {};
        visited[r][q] = new Hex(0, 0);
        // Todo: implement a priority queue for this when we have terrain-dependent costs
        const queue: Hex[] = [unit.terrain];
        let iterCount = 0;

        while (queue.length > 0) {
            iterCount++;
            const next = queue.shift();
            let tile: Hex = this.game.getTerrainSegment(next.r, next.q);
            if (!tile) {
                continue;
            }

            if (tile.q === target.q && tile.r === target.r) {
                const result: Hex[] = [];
                while (tile.q !== q || tile.r !== r) {
                    if (!visited[tile.r][tile.q]) {
                        break;
                    }
                    result.push(new Hex(0, 0).diff(visited[tile.r][tile.q]));
                    tile = tile.sum(visited[tile.r][tile.q]);
                }
                log("Calculated in", iterCount, "iterations");
                return result;
            }

            tile.neighbours().forEach((neighbor: TerrainSegment) => {
                if (!visited[neighbor.r]) {
                    visited[neighbor.r] = {};
                }
                if (!visited[neighbor.r][neighbor.q]) {
                    visited[neighbor.r][neighbor.q] = tile.diff(neighbor);
                    queue.push(neighbor);
                }
            });
        }

        throw new Error(`Couldn't find a path from (${r},${q}) to (${target.r},${target.q})`);
    }
}
