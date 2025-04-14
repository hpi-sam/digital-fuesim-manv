import type { Mutable } from './index.js';

const _socketIoTransports = {
    transports: ['websocket'],
} as const;

export const socketIoTransports = _socketIoTransports as Mutable<
    typeof _socketIoTransports
>;
