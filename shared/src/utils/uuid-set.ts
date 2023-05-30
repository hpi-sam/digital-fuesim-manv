import type { UUID } from '.';

export type UUIDSet = {
    readonly [key in UUID]: true;
};
