import type { Server as HttpServer } from 'node:http';
import cors from 'cors';
import type { Express } from 'express';
import express from 'express';
import type { DatabaseService } from '../database/services/database-service';
import {
    deleteExercise,
    getExercise,
    getExerciseHistory,
    postExercise,
} from './http-handler/api/exercise';
import { getHealth } from './http-handler/api/health';
import { secureHttp } from './http-handler/secure-http';

export class ExerciseHttpServer {
    public readonly httpServer: HttpServer;
    constructor(app: Express, port: number, databaseService: DatabaseService) {
        // TODO: Temporary allow all
        app.use(cors());

        app.use(express.json({ limit: '200mb' }));

        // This endpoint is used to determine whether the API itself is running.
        // It should be independent from any other services that may or may not be running.
        // This is used for the Cypress CI.
        app.get('/api/health', (req) => secureHttp(getHealth));
        app.post('/api/exercise', (req) =>
            secureHttp(async () => postExercise(databaseService, req.body))
        );
        app.get('/api/exercise/:exerciseId', (req) =>
            secureHttp(() => getExercise(req.params.exerciseId))
        );
        app.delete('/api/exercise/:exerciseId', (req) =>
            secureHttp(async () => deleteExercise(req.params.exerciseId))
        );
        app.get('/api/exercise/:exerciseId/history', (req) =>
            secureHttp(async () => getExerciseHistory(req.params.exerciseId))
        );

        this.httpServer = app.listen(port);
    }

    public close(): void {
        this.httpServer.close();
    }
}
