import type { Mutable } from './immutability.js';
import type { UUID, UUIDSet } from './index.js';

export function arrayToUUIDSet(uuids: ReadonlyArray<UUID>) {
    const set: Mutable<UUIDSet> = {};
    for (const uuid of uuids) {
        set[uuid] = true;
    }
    return set;
}
