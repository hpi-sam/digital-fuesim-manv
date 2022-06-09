import type { Express, Request as ExpressRequest } from 'express';
import type { HttpResponse } from './utils';

export type HttpMethod =
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put';

export async function secureHttp<
    Method extends HttpMethod,
    Result extends object | undefined
>(
    app: Express,
    method: Method,
    route: string,
    operation: (
        req: ExpressRequest
    ) => HttpResponse<Result> | Promise<HttpResponse<Result>>
) {
    // TODO: Better type `req` to verify the arguments
    app[method](route, async (req, res) => {
        let response: HttpResponse<Result>;
        try {
            response = await operation(req);
        } catch (error: unknown) {
            // Try sending 500 response
            try {
                const message = `An error occurred on http request: ${error}`;
                console.warn(message);
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
            return;
        }
        res.statusCode = response.statusCode;
        res.send(response.body);
    });
}
