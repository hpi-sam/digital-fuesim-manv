import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { SocketReservedEventsMap } from 'socket.io/dist/socket';
import request from 'supertest';
import { FuesimServer } from '../src/fuesim-server';
import type { ExerciseCreationResponse } from './http-exercise.spec';
import type { SocketReservedEvents } from './socket-reserved-events';

export type HttpMethod =
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put';

// Some helper types
/**
 * Returns the last element in an array
 */
type LastElement<T extends any[]> = T extends [...any[], infer R]
    ? R
    : T extends []
    ? undefined
    : never;

/**
 * Returns all but the last element in an array
 */
type HeadElement<T extends any[]> = T extends [...infer U, any] ? U : never;

/**
 * Merges two objects like
 * ```ts
 * type A = { a: 1, b: 2 };
 * type B = { c: 2 };
 * type C = MergeIntersection<A & B>; // { a: 1, b: 2, c: 2 }
 * ```
 */
type MergeIntersection<T> = T extends infer U
    ? { [K in keyof U]: U[K] }
    : never;

type AllClientToServerEvents = MergeIntersection<
    ClientToServerEvents & SocketReservedEventsMap
>;

type AllServerToClientEvents = MergeIntersection<
    ServerToClientEvents & SocketReservedEvents
>;

type ExerciseClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class WebsocketClient {
    constructor(private readonly socket: ExerciseClientSocket) {}

    public async emit<
        EventKey extends keyof AllClientToServerEvents,
        Event extends AllClientToServerEvents[EventKey] = AllClientToServerEvents[EventKey],
        EventParameters extends Parameters<Event> = Parameters<Event>,
        // We expect the callback to be the last parameter of the callback`
        EventCallback extends LastElement<EventParameters> = LastElement<EventParameters>,
        // If there is no callback, the response is just void
        Response extends EventCallback extends (...a: any[]) => any
            ? Parameters<EventCallback>[0]
            : void = EventCallback extends (...a: any[]) => any
            ? Parameters<EventCallback>[0]
            : void
    >(
        event: EventKey,
        ...args: HeadElement<Parameters<Event>>
    ): Promise<Response> {
        return new Promise<Response>((resolve) => {
            // TODO: can you emit a 'disconnect' event?
            this.socket.emit(event as any, ...args, resolve);
        });
    }

    public on<
        EventKey extends keyof AllServerToClientEvents,
        Callback extends AllServerToClientEvents[EventKey] = AllServerToClientEvents[EventKey]
    >(event: EventKey, callback: Callback): void {
        this.socket.on(event, callback as any);
    }

    private readonly callCounter: Map<string, number> = new Map();

    public spyOn(event: keyof AllServerToClientEvents): void {
        this.on(event, () =>
            this.callCounter.set(event, this.callCounter.get(event) ?? 0 + 1)
        );
    }

    public getTimesCalled(event: keyof AllServerToClientEvents): number {
        return this.callCounter.get(event) ?? 0;
    }
}

class TestEnvironment {
    public server: FuesimServer = FuesimServer.create();

    // `request.Test` extends `Promise<Response>`, therefore eslint wants the async keyword here.
    // The problem is that `Promise<request.Test>` not the same is as `request.Test` (but `Promise<T>` is equal to `Promise<Promise<T>>`).
    // The async keyword makes sure that everything returned is a Promise by wrapping it in a Promise.
    // In this case it would make the return type `Promise<request.Test>` which is incorrect.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    public httpRequest(method: HttpMethod, url: string): request.Test {
        return request(this.server.httpServer.httpServer)[method](url);
    }

    /**
     * Simplifies the process of simulating websocket requests and responses.
     * @param closure a function that gets a connected websocket client as its argument and should resolve after all operations are finished
     */
    public async withWebsocket(
        closure: (websocketClient: WebsocketClient) => Promise<any>
    ): Promise<void> {
        // TODO: This should not be hard coded
        let clientSocket: ExerciseClientSocket | undefined;
        try {
            clientSocket = io('ws://localhost:3200', {
                transports: socketIoTransports,
            });
            const websocketClient = new WebsocketClient(clientSocket);
            await closure(websocketClient);
        } finally {
            clientSocket?.close();
        }
    }
}

export const createTestEnvironment = (): TestEnvironment => {
    const environment = new TestEnvironment();
    // If this gets too slow, we may look into creating the server only once
    beforeEach(() => {
        environment.server = FuesimServer.create();
    });
    afterEach(() => {
        environment.server.destroy();
    });

    return environment;
};

export async function createExercise(
    environment: TestEnvironment
): Promise<string> {
    const response = await environment
        .httpRequest('post', '/api/exercise')
        .expect(201);

    return (response.body as ExerciseCreationResponse).exerciseId;
}
