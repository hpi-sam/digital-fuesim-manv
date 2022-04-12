import { cloneDeep } from 'lodash-es';
import type { Mutable } from './immutability';

/**
 * We often use `cloneDeep` to make a deep copy of an immutable object.
 * This function returns the correct mutable type.
 * @param obj The object to clone
 * @returns The cloned object
 */
export function cloneDeepMutable<T>(obj: T): T extends object ? Mutable<T> : T {
    return cloneDeep(obj) as T extends object ? Mutable<T> : T;
}
