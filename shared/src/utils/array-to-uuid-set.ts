import type { UUID, UUIDSet } from '.';

export function arrayToUUIDSet(uuids: ReadonlyArray<UUID>) {
    const set: UUIDSet = {};
    for (const uuid of uuids) {
        set[uuid] = true;
    }
    return set;
}
