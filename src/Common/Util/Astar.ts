import * as debug from "debug";
import {PriorityQueue} from "typescript-collections";

import {Hex} from "./Hex";

const log = debug("valta:A");

export interface IPath<T> {
    path: T[];
    cost: number;
}

interface IAstarNode<T extends Hex> {
    priority: number;
    cost: number;
    hex: T;
    parent: IAstarNode<T>;
}

const priorityQueueCompare = (a: IAstarNode<Hex>, b: IAstarNode<Hex>): number => {
    return b.priority - a.priority;
};

export type Neighbours<T> = (thing: T) => T[];
export type Cost<T> = (current: T, next: T) => number;

export function astar<T extends Hex>(start: T, end: T, neighbours: Neighbours<T>, cost: Cost<T>): IPath<T> {
    const queue = new PriorityQueue<IAstarNode<T>>(priorityQueueCompare);
    const touchy: {[id: string]: IAstarNode<T>} = {};

    queue.enqueue({
        cost: 0,
        hex: start,
        parent: null,
        priority: 0,
    });

    while (!queue.isEmpty()) {
        const current = queue.dequeue();

        if (current.hex.equals(end)) {
            return pathyPath(current, start);
        }

        const currentNeighbours = neighbours(current.hex);
        for (const neigh of currentNeighbours) {
            const newCost = current.cost + cost(current.hex, neigh);
            const neighId = neigh.hash();
            const touched = neighId in touchy;

            if (!touched || newCost < touchy[neighId].cost) {
                touchy[neighId] = {
                    cost: newCost,
                    hex: neigh,
                    parent: current,
                    priority: newCost + neigh.distanceTo(end),
                };

                queue.enqueue(touchy[neighId]);
            }
        }
    }

    throw new Error("No path found");
}

function pathyPath<T extends Hex>(node: IAstarNode<T>, startThing: T): IPath<T> {
    let current = node;
    const path = [current.hex];

    while (!current.hex.equals(startThing)) {
        current = current.parent;
        path.push(current.hex);
    }

    path.reverse();

    log(node.cost);
    log(path);

    return {
        cost: node.cost,
        path,
    };
}
