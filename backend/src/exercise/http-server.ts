import type * as core from 'express-serve-static-core';
import { postExercise } from './http-handler/api/exercise';

export const setupHttpServer = (app: core.Express, port: number) => {
    app.post('/api/exercise', (req, res) => {
        const result = postExercise();
        res.statusCode = 201;
        res.send(result);
    });

    return app.listen(port);
};
