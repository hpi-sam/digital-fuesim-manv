import { bool, cleanEnv, makeValidator, str } from 'envalid';

export class Config {
    private static _websocketPort?: number;

    private static _httpPort?: number;

    private static _dbUser?: string;

    private static _dbPassword?: string;

    private static _dbName?: string;

    private static _useDataBase?: boolean;

    public static get websocketPort(): number {
        if (!this.isInitialized) {
            throw this.createUninitializedUseError();
        }
        return this._websocketPort!;
    }

    public static get httpPort(): number {
        if (!this.isInitialized) {
            throw this.createUninitializedUseError();
        }
        return this._httpPort!;
    }

    public static get dbUser(): string {
        if (!this.isInitialized) {
            throw this.createUninitializedUseError();
        }
        return this._dbUser!;
    }

    public static get dbPassword(): string {
        if (!this.isInitialized) {
            throw this.createUninitializedUseError();
        }
        return this._dbPassword!;
    }

    public static get dbName(): string {
        if (!this.isInitialized) {
            throw this.createUninitializedUseError();
        }
        return this._dbName!;
    }

    public static get useDataBase(): boolean {
        if (!this.isInitialized) {
            throw this.createUninitializedUseError();
        }
        return this._useDataBase!;
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
            DFM_DB_USER: str(),
            DFM_DB_PASSWORD: str(),
            DFM_DB_NAME: str(),
            DFM_USE_DATABASE: bool({ default: false }),
        });
    }

    private static isInitialized = false;

    private static createUninitializedUseError() {
        return new Error('Config was used uninitialized');
    }

    public static initialize(
        testing: boolean = false,
        forceRefresh: boolean = false
    ) {
        if (this.isInitialized && !forceRefresh) {
            return;
        }
        const env = this.parseVariables();
        this._websocketPort = testing
            ? env.DFM_WEBSOCKET_PORT_TESTING
            : env.DFM_WEBSOCKET_PORT;
        this._httpPort = testing
            ? env.DFM_HTTP_PORT_TESTING
            : env.DFM_HTTP_PORT;
        this._dbUser = env.DFM_DB_USER;
        this._dbPassword = env.DFM_DB_PASSWORD;
        this._dbName = env.DFM_DB_NAME;
        this._useDataBase = env.DFM_USE_DATABASE;
        this.isInitialized = true;
    }
}
