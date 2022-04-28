import { bool, cleanEnv, makeValidator, str } from 'envalid';

export class Config {
    private static _websocketPort?: number;

    private static _httpPort?: number;

    private static _dbUser?: string;

    private static _dbPassword?: string;

    private static _dbName?: string;

    private static _useDataBase?: boolean;

    public static get websocketPort(): number {
        return this._websocketPort!;
    }

    public static get httpPort(): number {
        return this._httpPort!;
    }

    public static get dbUser(): string {
        return this._dbUser!;
    }

    public static get dbPassword(): string {
        return this._dbPassword!;
    }

    public static get dbName(): string {
        return this._dbName!;
    }

    public static get useDataBase(): boolean {
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

    public static initialize(testing: boolean = false) {
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
    }
}
