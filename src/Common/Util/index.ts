export * from "./Promisify";
export * from "./Point";
export * from "./Hex";

export function getHSL(order: number) {
    const hue = Math.floor(360 * ((order * 0.618033988749895) % 1));
    return `hsl(${hue}, 100%, 75%)`;
}
