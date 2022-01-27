import type {
    ClientToServerEvents,
    ExerciseAction,
    ExerciseIds,
    ServerToClientEvents,
} from 'digital-fuesim-manv-shared';
import { socketIoTransports } from 'digital-fuesim-manv-shared';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import request from 'supertest';
import { FuesimServer } from '../src/fuesim-server';

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
 * Returns all but the last element in an array
 */
type HeadElement<T extends any[]> = T extends [...infer U, any] ? U : never;

// TODO: Restrict event names to actual events, as in other code
export class WebsocketClient {
    constructor(
        private readonly socket: Socket<DefaultEventsMap, DefaultEventsMap>
    ) {}

    public async emit<
        EventKey extends keyof ClientToServerEvents,
        Event extends ClientToServerEvents[EventKey] = ClientToServerEvents[EventKey],
        EventParameters extends Parameters<Event> = Parameters<Event>,
        // We expect the callback to be the last parameter of the callback`
        EventCallback extends LastElement<EventParameters> = LastElement<EventParameters>,
        Response extends Parameters<EventCallback>[0] = Parameters<EventCallback>[0]
    >(
        event: EventKey,
        ...args: HeadElement<Parameters<Event>>
    ): Promise<Response> {
        return new Promise<Response>((resolve) => {
            this.socket.emit(event, ...args, resolve);
        });
    }

    public on<
        EventKey extends keyof ServerToClientEvents,
        Callback extends ServerToClientEvents[EventKey] = ServerToClientEvents[EventKey]
    >(event: EventKey, callback: Callback): void {
        this.socket.on(event, callback as any);
    }

    private readonly calls: Map<string, ExerciseAction[]> = new Map();

    public spyOn(event: keyof ServerToClientEvents): void {
        this.on(event, (action) => {
            if (!this.calls.has(event)) {
                this.calls.set(event, []);
            }
            this.calls.get(event)!.push(action);
        });
    }

    public getTimesCalled(event: keyof ServerToClientEvents): number {
        return this.getCalls(event).length;
    }

    public getCalls(event: keyof ServerToClientEvents): ExerciseAction[] {
        return this.calls.get(event) ?? [];
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
        let clientSocket:
            | Socket<DefaultEventsMap, DefaultEventsMap>
            | undefined;
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
