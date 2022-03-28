/**
 * Merges two objects like
 * ```ts
 * type A = { a: 1, b: 2 };
 * type B = { c: 2 };
 * type C = MergeIntersection<A & B>; // { a: 1, b: 2, c: 2 }
 * ```
 */
export type MergeIntersection<T> = T extends infer U
    ? { [K in keyof U]: U[K] }
    : never;
