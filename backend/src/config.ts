import { cleanEnv, makeValidator } from 'envalid';

export class Config {
    private static _websocketPort?: number;

    private static _httpPort?: number;

    public static get websocketPort(): number {
        return this._websocketPort!;
    }

    public static get httpPort(): number {
        return this._httpPort!;
    }

    private static createTCPPortValidator() {
        return makeValidator((x) => {
            const int = Number.parseInt(x);
            if (!Number.isInteger(int) || !(int >= 0 && int < 2 ** 16)) {
                throw new TypeError('Expected a valid port number');
            }
            return int;
        });
    }

    private static parseVariables() {
        const tcpPortValidator = this.createTCPPortValidator();
        return cleanEnv(process.env, {
            DFM_WEBSOCKET_PORT: tcpPortValidator({ default: 3200 }),
            DFM_WEBSOCKET_PORT_TESTING: tcpPortValidator({ default: 13200 }),
            DFM_HTTP_PORT: tcpPortValidator({ default: 3201 }),
            DFM_HTTP_PORT_TESTING: tcpPortValidator({ default: 13201 }),
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
