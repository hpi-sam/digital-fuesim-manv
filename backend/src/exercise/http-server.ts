import type { Server as HttpServer } from 'node:http';
import cors from 'cors';
import type { Express, Request as ExpressRequest } from 'express';
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
        secureHttp(app, 'get', '/api/health', () => getHealth());

        secureHttp(app, 'post', '/api/exercise', async (req: ExpressRequest) =>
            postExercise(databaseService, req.body)
        );

        secureHttp(
            app,
            'get',
            '/api/exercise/:exerciseId',
            (req: ExpressRequest) => getExercise(req.params.exerciseId)
        );

        secureHttp(
            app,
            'delete',
            '/api/exercise/:exerciseId',
            async (req: ExpressRequest) => deleteExercise(req.params.exerciseId)
        );

        secureHttp(
            app,
            'get',
            '/api/exercise/:exerciseId/history',
            async (req: ExpressRequest) =>
                getExerciseHistory(req.params.exerciseId)
        );

        this.httpServer = app.listen(port);
    }

    public close(): void {
        this.httpServer.close();
    }
}
