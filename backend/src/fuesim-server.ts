import express from 'express';
import { ExerciseWebsocketServer } from './exercise/websocket';
import { ExerciseHttpServer } from './exercise/http-server';

export class FuesimServer {
    static create(websocketPort: number, httpPort: number) {
        const app = express();

        const websocketServer = new ExerciseWebsocketServer(app, websocketPort);
        const httpServer = new ExerciseHttpServer(app, httpPort);

        return new FuesimServer(websocketServer, httpServer);
    }

    constructor(
        private readonly _websocketServer: ExerciseWebsocketServer,
        private readonly _httpServer: ExerciseHttpServer
    ) {}

    public get websocketServer(): ExerciseWebsocketServer {
        return this._websocketServer;
    }

    public get httpServer(): ExerciseHttpServer {
        return this._httpServer;
    }

    public destroy() {
        this.httpServer.close();
        this.websocketServer.close();
    }
}
