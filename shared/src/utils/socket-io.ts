import type { Mutable } from '.';

const _socketIoTransports = {
    transports: ['websocket'],
} as const;

export const socketIoTransports = _socketIoTransports as Mutable<
    typeof _socketIoTransports
>;
