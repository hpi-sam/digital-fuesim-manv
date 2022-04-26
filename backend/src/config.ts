import { bool, cleanEnv, makeValidator } from 'envalid';

export class Config {
    private static _websocketPort?: number;

    private static _httpPort?: number;

    private static _usePredefinedExercise?: boolean;

    public static get websocketPort(): number {
        return this._websocketPort!;
    }

    public static get httpPort(): number {
        return this._httpPort!;
    }

    public static get usePredefinedExercise(): boolean {
        return this._usePredefinedExercise!;
    }

    private static createIntegerValidator() {
        return makeValidator((x) => {
            const int = Number.parseInt(x);
            if (!Number.isInteger(int)) {
                throw new TypeError('Expected an integer');
            }
            return int;
        });
    }

    private static parseVariables() {
        const integerValidator = this.createIntegerValidator();
        return cleanEnv(process.env, {
            DFM_WEBSOCKET_PORT: integerValidator({ default: 3200 }),
            DFM_WEBSOCKET_PORT_TESTING: integerValidator({ default: 13200 }),
            DFM_HTTP_PORT: integerValidator({ default: 3201 }),
            DFM_HTTP_PORT_TESTING: integerValidator({ default: 13201 }),
            DFM_USE_PREDEFINED_EXERCISE: bool({ default: true }),
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
        this._usePredefinedExercise = env.DFM_USE_PREDEFINED_EXERCISE;
    }
}
