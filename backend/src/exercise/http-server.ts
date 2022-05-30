import type { Server as HttpServer } from 'node:http';
import cors from 'cors';
import type * as core from 'express-serve-static-core';
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
    constructor(
        app: core.Express,
        port: number,
        databaseService: DatabaseService
    ) {
        // TODO: Temporary allow all
        app.use(cors());

        app.use(express.json());

        // This endpoint is used to determine whether the API itself is running.
        // It should be independent from any other services that may or may not be running.
        // This is used for the Cypress CI.
        app.get(
            '/api/health',
            secureHttp((req, res) => {
                const response = getHealth();
                res.statusCode = response.statusCode;
                res.send(response.body);
            })
        );

        app.post(
            '/api/exercise',
            secureHttp(async (req, res) => {
                const response = await postExercise(databaseService, req.body);
                res.statusCode = response.statusCode;
                res.send(response.body);
            })
        );

        app.get(
            '/api/exercise/:exerciseId',
            secureHttp((req, res) => {
                const response = getExercise(req.params.exerciseId);
                res.statusCode = response.statusCode;
                res.send(response.body);
            })
        );

        app.delete(
            '/api/exercise/:exerciseId',
            secureHttp(async (req, res) => {
                const response = await deleteExercise(req.params.exerciseId);
                res.statusCode = response.statusCode;
                res.send(response.body);
            })
        );

        app.get(
            '/api/exercise/:exerciseId/history',
            secureHttp(async (req, res) => {
                const response = await getExerciseHistory(
                    req.params.exerciseId
                );
                res.statusCode = response.statusCode;
                res.send(response.body);
            })
        );

        this.httpServer = app.listen(port);
    }

    public close(): void {
        this.httpServer.close();
    }
}
