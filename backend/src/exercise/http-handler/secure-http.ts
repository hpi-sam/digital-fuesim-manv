import type {
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';
import type { HttpResponse } from './utils';

export type HttpMethod =
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put';

export function secureHttp<Result extends object | undefined>(
    operation: () => HttpResponse<Result> | Promise<HttpResponse<Result>>
): (req: ExpressRequest, res: ExpressResponse) => Promise<void> {
    return async (_req: ExpressRequest, res: ExpressResponse) => {
        let response: HttpResponse<Result>;
        try {
            response = await operation();
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
    };
}
