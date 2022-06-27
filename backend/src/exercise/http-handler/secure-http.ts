import type { HttpResponse } from './utils';

export function secureHttp(
    callback: (req: any, res: any) => Promise<any> | any
): (req: any, res: any) => Promise<any> {
    return async (req: any, res: any) => {
        try {
            // eslint-disable-next-line @typescript-eslint/return-await
            return await callback(req, res);
        } catch (e: unknown) {
            // Try sending 500 reply
            try {
                const message = `An error occurred on http request: ${e}`;
                console.warn(message);
                res.send({
                    statusCode: 500,
                    body: { message },
                } as HttpResponse);
            } catch (innerError: unknown) {
                // Nothing works. Log if in production mode.
                if (process.env.NODE_ENV !== 'production') {
                    throw innerError;
                }
                console.warn(
                    `An error occurred while handling above http error and trying to respond to client: ${innerError}`
                );
            }
        }
    };
}
