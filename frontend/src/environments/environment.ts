import type { Environment } from './environment-type';

export const environment: Environment = {
    production: true,
    httpProtocol: 'http',
    httpPort: 3201,
    websocketProtocol: 'ws',
    websocketPort: 3200,
};

// to ignore zone related error stack frames such as `zone.run` and `zoneDelegate.invokeTask`.
import 'zone.js/plugins/zone-error';
