import type { UUID } from './index.js';

export type UUIDSet = {
    readonly [key in UUID]: true;
};
