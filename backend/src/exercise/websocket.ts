import type { ExerciseSocket, ExerciseServer } from '../exercise-server';
import { clientMap } from './client-map';
import { ClientWrapper } from './client-wrapper';
import { exerciseMap } from './exercise-map';
import { ExerciseWrapper } from './exercise-wrapper';
import {
    registerGetStateHandler,
    registerJoinExerciseHandler,
    registerProposeActionHandler,
} from './websocket-handler';

export const setupWebsocket = (io: ExerciseServer, port: number): ExerciseServer => {

    const websocketServer = io.listen(port);

    io.on('connection', (socket) => {
        console.log('a user connected');
        registerClient(socket);
    });

    const exerciseWrapper = new ExerciseWrapper();
    exerciseMap.set('abcdefghijk', exerciseWrapper);
    const registerClient = (client: ExerciseSocket): void => {
        // Add client
        clientMap.set(client, new ClientWrapper(client));

        // register handlers
        registerGetStateHandler(io, client);
        registerProposeActionHandler(io, client);
        registerJoinExerciseHandler(io, client);
    };

    return websocketServer;
};
