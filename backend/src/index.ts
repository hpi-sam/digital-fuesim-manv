import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import type { ExerciseServer } from './exercise-server';
import { setupWebsocket } from './exercise/websocket';
import { setupHttpServer } from './exercise/http-server';

const app = express();

const httpServer = createServer(app);

const io: ExerciseServer = new Server(httpServer, {
    // TODO: this is only a temporary solution to make this work
    cors: {
        origin: '*',
    },
});

setupWebsocket(io);
setupHttpServer(app);
