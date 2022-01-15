import { SocketResponse } from 'digital-fuesim-manv-shared';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import request from 'supertest';
import { FuesimServer } from './fuesim-server';

export enum HttpMethod {
    GET = 'get',
    PATCH = 'patch',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    OPTIONS = 'options',
    HEAD = 'head',
}

// TODO: Restrict event names to actual events, as in other code
export class WebsocketClient {
    constructor(
        private readonly socket: Socket<DefaultEventsMap, DefaultEventsMap>
    ) {}

    public emit<T>(event: string, ...args: any[]): Promise<SocketResponse<T>> {
        return new Promise<SocketResponse<T>>((resolve) => {
            this.socket.emit(event, ...args, resolve);
        });
    }

    public on(event: string, callback: (...args: any[]) => void): void {
        this.socket.on(event, callback);
    }

    private callCounter: Map<string, number> = new Map();

    public spyOn(event: string): void {
        this.on(event, () =>
            this.callCounter.set(event, this.callCounter.get(event) ?? 0 + 1)
        );
    }

    public timesCalled(event: string): number {
        return this.callCounter.get(event) ?? 0;
    }
}

class TestEnvironment {
    public server: FuesimServer = FuesimServer.create();

    public httpRequest(method: HttpMethod, url: string): request.Test {
        return request(this.server.httpServer)[method](url);
    }

    public withWebsocket(
        closure: (websocketClient: WebsocketClient) => void
    ): void {
        // TODO: This should not be hard coded
        const clientSocket = io('ws://localhost:3200');
        const websocketClient = new WebsocketClient(clientSocket);
        closure(websocketClient);
        clientSocket.close();
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
