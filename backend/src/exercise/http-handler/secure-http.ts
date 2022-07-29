import type { Response as ExpressResponse } from 'express';
import type { HttpResponse } from './utils';

export type HttpMethod =
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put';

export async function secureHttp<Result extends object | undefined>(
    operation: () => HttpResponse<Result> | Promise<HttpResponse<Result>>,
    res: ExpressResponse
): Promise<void> {
    try {
        const response = await operation();
        res.statusCode = response.statusCode;
        res.send(response.body);
    } catch (error: unknown) {
        // Try sending 500 response
        try {
            const message = `An error occurred on http request: ${error}`;
            console.warn(
                message,
                error instanceof Error && error.stack
                    ? `at ${error.stack}`
                    : 'no error or no stack'
            );
            res.statusCode = 500;
            res.send({
                statusCode: 500,
                body: { message },
            });
        } catch (innerError: unknown) {
            // Nothing works. Log if in production mode, otherwise re-throw inner error
            if (process.env.NODE_ENV !== 'production') {
                throw innerError;
            }
            console.warn(
                `An error occurred while handling above http error and trying to respond to client: ${innerError}`
            );
        }
    }
}
