import type { Environment } from './environment-type';

export const environment: Environment = {
    production: true,
    httpProtocol: 'http',
    httpPort: 3201,
    websocketProtocol: 'ws',
    websocketPort: 3200,
};
