import express from 'express';
import { ExerciseWebsocketServer } from './exercise/websocket';
import { ExerciseHttpServer } from './exercise/http-server';

export class FuesimServer {
    private readonly _httpServer: ExerciseHttpServer;
    private readonly _websocketServer: ExerciseWebsocketServer;

    constructor(websocketPort: number, httpPort: number) {
        const app = express();
        this._websocketServer = new ExerciseWebsocketServer(app, websocketPort);
        this._httpServer = new ExerciseHttpServer(app, httpPort);
    }

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
