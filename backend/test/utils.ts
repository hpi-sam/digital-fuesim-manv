import type {
    ClientToServerEvents,
    ExerciseIds,
    ServerToClientEvents,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import request from 'supertest';
import { Config } from '../src/config';
import { FuesimServer } from '../src/fuesim-server';
import type { SocketReservedEvents } from './socket-reserved-events';

export type HttpMethod =
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put';

export interface ExerciseCreationResponse {
    readonly participantId: string;
    readonly trainerId: string;
}

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
 * Returns an array of all but the last element in an array
 * ```ts
 * HeadElements<[1]> // []
 * HeadElements<[1, string, 3]> // [1, string]
 * ```
 */
type HeadElements<T extends any[]> = T extends [...infer U, any] ? U : never;

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

type AllServerToClientEvents = MergeIntersection<
    ServerToClientEvents & SocketReservedEvents
>;

type ExerciseClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class WebsocketClient {
    constructor(private readonly socket: ExerciseClientSocket) {}

    public async emit<
        EventKey extends keyof ClientToServerEvents,
        Event extends ClientToServerEvents[EventKey] = ClientToServerEvents[EventKey],
        EventParameters extends Parameters<Event> = Parameters<Event>,
        // We expect the callback to be the last parameter
        EventCallback extends LastElement<EventParameters> = LastElement<EventParameters>,
        Response extends Parameters<EventCallback>[0] = Parameters<EventCallback>[0]
    >(
        event: EventKey,
        ...args: HeadElements<Parameters<Event>>
    ): Promise<Response> {
        return new Promise<Response>((resolve) => {
            this.socket.emit(event as any, ...args, resolve);
        });
    }

    public on<
        EventKey extends keyof AllServerToClientEvents,
        Callback extends AllServerToClientEvents[EventKey] = AllServerToClientEvents[EventKey]
    >(event: EventKey, callback: Callback): void {
        this.socket.on(event, callback as any);
    }

    private readonly calls: Map<
        string,
        Parameters<AllServerToClientEvents[keyof AllServerToClientEvents]>[]
    > = new Map();

    public spyOn(event: keyof AllServerToClientEvents): void {
        this.on(event, (action: any) => {
            if (!this.calls.has(event)) {
                this.calls.set(event, []);
            }
            this.calls.get(event)!.push(action);
        });
    }

    public getTimesCalled(event: keyof AllServerToClientEvents): number {
        return this.getCalls(event).length;
    }

    public getCalls<EventKey extends keyof AllServerToClientEvents>(
        event: EventKey
    ): Parameters<AllServerToClientEvents[EventKey]>[] {
        return this.calls.get(event) ?? ([] as any[]);
    }
}

class TestEnvironment {
    public server: FuesimServer;

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
        let clientSocket: ExerciseClientSocket | undefined;
        try {
            // TODO: The uri should not be hard coded
            clientSocket = io(`ws://localhost:${Config.websocketPort}`, {
                transports: socketIoTransports,
            });
            const websocketClient = new WebsocketClient(clientSocket);
            await closure(websocketClient);
        } finally {
            clientSocket?.close();
        }
    }

    public constructor() {
        Config.initialize(true);
        this.server = FuesimServer.create();
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
): Promise<ExerciseIds> {
    const response = await environment
        .httpRequest('post', '/api/exercise')
        .expect(201);

    return response.body as ExerciseCreationResponse;
}

export async function sleep(ms: number) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
}
