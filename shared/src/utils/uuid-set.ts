import type { UUID } from '.';

export interface UUIDSet {
    readonly [key: UUID]: true;
}
