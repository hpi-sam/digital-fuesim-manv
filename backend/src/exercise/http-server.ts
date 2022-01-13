import type * as core from 'express-serve-static-core';
import { postExercise } from './http-handler/api/exercise';

export const setupHttpServer = (app: core.Express) => {
    app.post('/api/exercise', (req, res) => {
        const result = postExercise();
        res.send(result);
    });

    return app.listen(3201);
};
