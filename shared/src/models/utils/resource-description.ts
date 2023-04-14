import { StrictObject } from '../../utils';

export const addResourceDescription = createCombine((a, b) => a + b);
export const subtractResourceDescription = createCombine((a, b) => a - b);
export const greaterEqualResourceDescription = createCompare((a, b) => a >= b);
export const scaleResourceDescription = createMap((a, s) => a * s);
export const ceilResourceDescription = createMap(Math.ceil);
export const maxResourceDescription = createMap(Math.max);

export type ResourceDescription<K extends string = string> = {
    [key in K]: number;
};

type ReadonlyResourceDescription<K extends string = string> = {
    readonly [key in K]: number;
};

export function createCombine(fn: (a: number, b: number) => number) {
    return <K extends string>(
        a: ResourceDescription<K>,
        b: ResourceDescription<K>
    ) =>
        Object.fromEntries(
            StrictObject.keys(a).map((key) => [key, fn(a[key], b[key])])
        ) as ResourceDescription<K>;
}

export function createCompare(fn: (a: number, b: number) => boolean) {
    return <K extends string>(
        a: ReadonlyResourceDescription<K>,
        b: ReadonlyResourceDescription<K>
    ) => StrictObject.keys(a).every((k) => fn(a[k], b[k]));
}

export function createMap(fn: (a: number, ...args: any) => number) {
    return <K extends string>(
        a: ReadonlyResourceDescription<K>,
        ...args: any
    ) =>
        Object.fromEntries(
            StrictObject.entries(a).map(([k, v]) => [k, fn(v, ...args)])
        ) as ResourceDescription<K>;
}
