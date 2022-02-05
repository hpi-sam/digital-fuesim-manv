import express from 'express';
import { ExerciseWebsocketServer } from './exercise/websocket';
import { ExerciseHttpServer } from './exercise/http-server';
import { Config } from './config';

export class FuesimServer {
    private static _singleInstance?: FuesimServer;

    static create(
        websocketPort: number = Config.websocketPort,
        httpPort: number = Config.httpPort
    ) {
        if (this._singleInstance) {
            this._singleInstance.destroy();
        }
        const app = express();

        const websocketServer = new ExerciseWebsocketServer(app, websocketPort);
        const httpServer = new ExerciseHttpServer(app, httpPort);

        this._singleInstance = new FuesimServer(websocketServer, httpServer);
        return this.singleInstance;
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
