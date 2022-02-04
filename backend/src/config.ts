import { cleanEnv, makeValidator } from 'envalid';

class ConfigNotSetUpError extends Error {
    public constructor() {
        super('The Config is not properly set up.');
    }
}

export class Config {
    private static _websocketPort?: number;

    private static _httpPort?: number;

    public static get websocketPort(): number {
        if (this._websocketPort === undefined) {
            throw new ConfigNotSetUpError();
        }
        return this._websocketPort;
    }

    public static get httpPort(): number {
        if (this._httpPort === undefined) {
            throw new ConfigNotSetUpError();
        }
        return this._httpPort;
    }

    private static parseVariables() {
        const integer = makeValidator((x) => {
            const int = Number.parseInt(x);
            if (!Number.isInteger(int)) {
                throw new TypeError('Expected an integer');
            }
            return int;
        });
        return cleanEnv(process.env, {
            DFM_WEBSOCKET_PORT: integer({ default: 3200 }),
            DFM_WEBSOCKET_PORT_TESTING: integer({ default: 13200 }),
            DFM_HTTP_PORT: integer({ default: 3201 }),
            DFM_HTTP_PORT_TESTING: integer({ default: 13201 }),
        });
    }

    public static initialize(testing: boolean = false) {
        const env = this.parseVariables();
        this._websocketPort = testing
            ? env.DFM_WEBSOCKET_PORT_TESTING
            : env.DFM_WEBSOCKET_PORT;
        this._httpPort = testing
            ? env.DFM_HTTP_PORT_TESTING
            : env.DFM_HTTP_PORT;
    }
}
