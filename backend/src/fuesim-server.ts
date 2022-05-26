import express from 'express';
import { ExerciseWebsocketServer } from './exercise/websocket';
import { ExerciseHttpServer } from './exercise/http-server';
import { Config } from './config';
import type { DatabaseService } from './database/services/database-service';

export class FuesimServer {
    private readonly _httpServer: ExerciseHttpServer;
    private readonly _websocketServer: ExerciseWebsocketServer;

    constructor(
        databaseService: DatabaseService,
        websocketPort: number = Config.websocketPort,
        httpPort: number = Config.httpPort
    ) {
        const app = express();
        this._websocketServer = new ExerciseWebsocketServer(app, websocketPort);
        this._httpServer = new ExerciseHttpServer(
            app,
            httpPort,
            databaseService
        );
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
