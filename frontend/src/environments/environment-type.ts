export interface Environment {
    production: boolean;
    /**
     * The port the backend HTTP server listens on
     */
    httpPort: number;
    httpProtocol: 'http' | 'https';
    /**
     * The port the backend websocket server listens on
     */
    websocketPort: number;
    websocketProtocol: 'ws' | 'wss';
}
