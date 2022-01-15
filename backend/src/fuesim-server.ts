import type { Server as HttpServer } from 'node:http';
import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import type { ExerciseServer } from './exercise-server';
import { setupWebsocket } from './exercise/websocket';
import { setupHttpServer } from './exercise/http-server';

export class FuesimServer {
    private static _singleInstance?: FuesimServer;

    static create(websocketPort: number = 3200, httpPort: number = 3201) {
        if (this._singleInstance) {
            this._singleInstance.destroy();
        }
        const app = express();

        const server = createServer(app);

        const io: ExerciseServer = new Server(server, {
            // TODO: this is only a temporary solution to make this work
            cors: {
                origin: '*',
            },
        });

        const websocketServer = setupWebsocket(io, websocketPort);
        const httpServer = setupHttpServer(app, httpPort);

        this._singleInstance = new FuesimServer(websocketServer, httpServer);
        return this.singleInstance;
    }

    constructor(
        private readonly _websocketServer: ExerciseServer,
        private readonly _httpServer: HttpServer
    ) {}

    public get websocketServer(): ExerciseServer {
        return this._websocketServer;
    }

    public get httpServer(): HttpServer {
        return this._httpServer;
    }

    public static get singleInstance(): FuesimServer {
        if (!this._singleInstance) {
            this._singleInstance = this.create();
        }
        return this._singleInstance;
    }

    public destroy() {
        this.httpServer.close();
        this.websocketServer.close();
    }
}
