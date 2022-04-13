import type { Mutable } from './immutability';
import type { UUID, UUIDSet } from '.';

export function arrayToUUIDSet(uuids: ReadonlyArray<UUID>) {
    const set: Mutable<UUIDSet> = {};
    for (const uuid of uuids) {
        set[uuid] = true;
    }
    return set;
}
