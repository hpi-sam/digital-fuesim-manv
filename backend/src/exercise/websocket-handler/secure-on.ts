import type { ClientToServerEvents } from 'digital-fuesim-manv-shared';
// eslint-disable-next-line no-restricted-imports
import type { SocketReservedEventsMap } from 'socket.io/dist/socket';
// eslint-disable-next-line no-restricted-imports
import type {
    ReservedOrUserEventNames,
    ReservedOrUserListener,
} from 'socket.io/dist/typed-events';
import type { ExerciseSocket } from '../../exercise-server';

function isDevelopment() {
    return process.env.NODE_ENV !== 'production';
}

export function secureOn<
    Ev extends ReservedOrUserEventNames<
        SocketReservedEventsMap,
        ClientToServerEvents
    >,
    Callback extends ReservedOrUserListener<
        SocketReservedEventsMap,
        ClientToServerEvents,
        Ev
    >
>(client: ExerciseSocket, event: Ev, listener: Callback) {
    client.on(event, (async (
        arg0: any,
        arg1: any,
        callback: any,
        ...args: any[]
    ) => {
        try {
            await listener(arg0, arg1, callback, ...args);
        } catch (e: unknown) {
            if (isDevelopment()) {
                throw e;
            }
            console.warn(
                `An error occurred while receiving a \`${event}\` event.`,
                e
            );
        }
    }) as Callback);
}
