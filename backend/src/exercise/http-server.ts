import type { Server as HttpServer } from 'node:http';
import cors from 'cors';
import type * as core from 'express-serve-static-core';
import { deleteExercise, postExercise } from './http-handler/api/exercise';

export class ExerciseHttpServer {
    public readonly httpServer: HttpServer;
    constructor(app: core.Express, port: number) {
        // TODO: Temporary allow all
        app.use(cors());
        app.post('/api/exercise', (req, res) => {
            const response = postExercise();
            res.statusCode = response.statusCode;
            res.send(response.body);
        });

        app.delete('/api/exercise/:exerciseId', (req, res) => {
            const response = deleteExercise(req.params.exerciseId);
            res.statusCode = response.statusCode;
            res.send(response.body);
        });

        this.httpServer = app.listen(port);
    }

    public close(): void {
        this.httpServer.close();
    }
}
