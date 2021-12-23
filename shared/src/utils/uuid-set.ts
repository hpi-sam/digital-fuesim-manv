import type { UUID } from './uuid';

export interface UUIDSet {
    [key: UUID]: true;
}
