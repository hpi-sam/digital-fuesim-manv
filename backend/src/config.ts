class ConfigNotSetUpError extends Error {
    public constructor() {
        super('The Config is not properly set up.');
    }
}

class InvalidConfigValue extends Error {
    public constructor(field: string, value: any) {
        super(
            `Setting up config field ${field} with value \`${value}\` is not possible.`
        );
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

    private static setWebsocketPort(target: string) {
        const converted = Number.parseInt(target);
        if (!Number.isInteger(converted)) {
            throw new InvalidConfigValue('websocketPort', target);
        }
        this._websocketPort = converted;
    }

    public static get httpPort(): number {
        if (this._httpPort === undefined) {
            throw new ConfigNotSetUpError();
        }
        return this._httpPort;
    }

    private static setHttpPort(target: string) {
        const converted = Number.parseInt(target);
        if (!Number.isInteger(converted)) {
            throw new InvalidConfigValue('httpPort', target);
        }
        this._httpPort = converted;
    }

    public static initialize(testing: boolean = false) {
        this.setWebsocketPort(
            (testing ? process.env.DFM_WEBSOCKET_PORT_TESTING : undefined) ??
                process.env.DFM_WEBSOCKET_PORT ??
                '3200'
        );
        this.setHttpPort(
            (testing ? process.env.DFM_HTTP_PORT_TESTING : undefined) ??
                process.env.DFM_HTTP_PORT ??
                '3201'
        );
    }
}
