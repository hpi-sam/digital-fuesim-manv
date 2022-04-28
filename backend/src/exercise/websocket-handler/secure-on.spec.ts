import { createTestEnvironment, sleep } from '../../../test/utils';

describe('secure on', () => {
    const environment = createTestEnvironment();
    it('does not crash in production environment when fed with invalid data', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        await environment.withWebsocket(async (socket) => {
            const promise = new Promise<void>((resolve) => {
                socket.insecureEmit('getState', 'any');
                // wait a bit so that the error can occur
                sleep(1000).then(async () => {
                    // Check whether the server is still available
                    await environment
                        .httpRequest('get', '/api/health')
                        .expect(200);
                    resolve();
                });
            });
            await promise;
        });
        process.env.NODE_ENV = originalEnv;
    });
    // it('does crash in development environment when fed with invalid data', async () => {
    //     const originalEnv = process.env.NODE_ENV;
    //     process.env.NODE_ENV = 'development';
    //     await environment.withWebsocket(async (socket) => {
    //         const promise = new Promise<void>((resolve) => {
    //             socket.insecureEmit('getState', 'any');
    //             // wait a bit so that the error can occur
    //             sleep(1000).then(async () => {
    //                 // Check whether the server is still available
    //                 await environment
    //                     .httpRequest('get', '/api/health')
    //                     .expect(200);
    //                 resolve();
    //             });
    //         });
    //         await promise;
    //     });
    //     process.env.NODE_ENV = originalEnv;
    // });
});
