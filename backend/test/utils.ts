import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from 'digital-fuesim-manv-shared';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import request from 'supertest';
import { FuesimServer } from '../src/fuesim-server';

export type HttpMethod =
    'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put';

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

    private readonly callCounter: Map<string, number> = new Map();

    public spyOn(event: keyof ServerToClientEvents): void {
        this.on(event, () =>
            this.callCounter.set(event, this.callCounter.get(event) ?? 0 + 1)
        );
    }

    public getTimesCalled(event: keyof ServerToClientEvents): number {
        return this.callCounter.get(event) ?? 0;
    }
}

class TestEnvironment {
    public server: FuesimServer = FuesimServer.create();

    public async httpRequest(method: HttpMethod, url: string): request.Test {
        return request(this.server.httpServer.httpServer)[method](url);
    }

    /**
     * Simplifies the process of simulating websocket requests and responses.
     * @param closure a function that gets a connected websocket client as its argument and should resolve after all operations are finished
     */
    public async withWebsocket(
        closure: (websocketClient: WebsocketClient) => Promise<void>
    ): Promise<void> {
        // TODO: This should not be hard coded
        let clientSocket:
            | Socket<DefaultEventsMap, DefaultEventsMap>
            | undefined;
        try {
            clientSocket = io('ws://localhost:3200');
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
