import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

// TODO: Give this project at least some kind of structure!
const PORT = 8000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    /* options */
});

io.on('connection', (socket) => {
    // ...
});

httpServer.listen(PORT);
