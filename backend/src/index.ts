import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

// TODO: Give this project at least some kind of structure!
const PORT = 3200;

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    // TODO: this is only a temporary solution to make this work
    cors: {
        origin: '*',
    },
});

io.listen(PORT);

io.on('connection', (socket) => {
    console.log('a user connected');
    registerClient(socket);
});

// const state = new Exercise();

function registerClient(client: Socket) {
    // send the current state to the client
    // TODO:

    // register handlers
    client.on('action', (action) => {
        // exerciseReducer(state, action);
        // client.emit('action', action);
        io.emit('action', action);
    });
}
