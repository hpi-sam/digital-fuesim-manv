import { freeze } from 'immer';
import { cloneDeep } from 'lodash-es';
import type { Immutable, Mutable } from './immutability';

/**
 * We often use `cloneDeep` to make a deep copy of an immutable object.
 * This function returns the correct mutable type.
 * @param obj The object to clone
 * @returns The cloned object
 */
export function cloneDeepMutable<T>(obj: T): T extends object ? Mutable<T> : T {
    return cloneDeep(obj) as T extends object ? Mutable<T> : T;
}

/**
 * We often use `cloneDeep` to make a deep copy of an mutable object.
 * This function returns the object as immutable type and freezes it recursively.
 * @param obj The object to clone
 * @returns The cloned object
 */
export function cloneDeepImmutable<T>(
    obj: T
): T extends object ? Immutable<T> : T {
    return freeze(cloneDeep(obj) as T extends object ? Immutable<T> : T, true);
}
