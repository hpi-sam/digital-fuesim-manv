import type { Server as HttpServer } from 'node:http';
import cors from 'cors';
import type * as core from 'express-serve-static-core';
import { postExercise } from './http-handler/api/exercise';

export class ExerciseHttpServer {
    public readonly httpServer: HttpServer;
    constructor(app: core.Express, port: number) {
        // TODO: Temporary allow all
        app.use(cors());
        app.post('/api/exercise', (req, res) => {
            const result = postExercise();
            res.statusCode = 201;
            res.send(result);
        });

        this.httpServer = app.listen(port);
    }

    public close(): void {
        this.httpServer.close();
    }
}
