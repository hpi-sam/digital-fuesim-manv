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

export function createCombine(transform: (a: number, b: number) => number) {
    return <K extends string>(
        a: ResourceDescription<K>,
        b: ResourceDescription<K>
    ) =>
        Object.fromEntries(
            StrictObject.keys(a).map((key) => [key, transform(a[key], b[key])])
        ) as ResourceDescription<K>;
}

export function createCompare(comparator: (a: number, b: number) => boolean) {
    return <K extends string>(
        a: ReadonlyResourceDescription<K>,
        b: ReadonlyResourceDescription<K>
    ) => StrictObject.keys(a).every((key) => comparator(a[key], b[key]));
}

export function createMap(fn: (a: number, ...args: any) => number) {
    return <K extends string>(
        a: ReadonlyResourceDescription<K>,
        ...args: any
    ) =>
        Object.fromEntries(
            StrictObject.entries(a).map(([key, value]) => [
                key,
                fn(value, ...args),
            ])
        ) as ResourceDescription<K>;
}

export function addPartialResourceDescriptions<K extends string>(
    resourceDescriptions: Partial<ResourceDescription<K>>[]
): Partial<ResourceDescription<K>> {
    return resourceDescriptions.reduce<Partial<ResourceDescription<K>>>(
        (total, current) => {
            StrictObject.entries(current).forEach(([key, value]) => {
                total[key] = (total[key] ?? 0) + (value ?? 0);
            });
            return total;
        },
        {}
    );
}

export function subtractPartialResourceDescriptions<K extends string>(
    minuend: Partial<ResourceDescription<K>>,
    subtrahend: Partial<ResourceDescription<K>>
): Partial<ResourceDescription<K>> {
    const result = addPartialResourceDescriptions([
        minuend,
        scaleResourceDescription(subtrahend as ResourceDescription, -1),
    ]);
    StrictObject.entries(result)
        .filter(([_, value]) => (value ?? 0) <= 0)
        .forEach(([key]) => delete result[key]);
    return result;
}
