import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ExerciseServer } from './exercise-server';
import { setupWebsocket } from './exercise/websocket';

const app = express();

const httpServer = createServer(app);

const io: ExerciseServer = new Server(httpServer, {
    // TODO: this is only a temporary solution to make this work
    cors: {
        origin: '*',
    },
});

setupWebsocket(io);
