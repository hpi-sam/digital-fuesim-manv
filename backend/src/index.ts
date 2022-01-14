import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import type { ExerciseServer } from './exercise-server';
import { setupWebsocket } from './exercise/websocket';
import { setupHttpServer } from './exercise/http-server';

interface Servers {
    websocketServer: ExerciseServer;
    httpServer: Server;
}

let servers: Servers;

export const main = () => {
    const app = express();

    const server = createServer(app);

    const io: ExerciseServer = new Server(server, {
        // TODO: this is only a temporary solution to make this work
        cors: {
            origin: '*',
        },
    });

    const websocketServer = setupWebsocket(io);
    const httpServer = setupHttpServer(app);

    servers = {
        websocketServer,
        httpServer: httpServer as any as Server,
    };

    return httpServer;
};

export const closeServers = () => {
    servers.httpServer.close();
    servers.websocketServer.close();
};

main();
