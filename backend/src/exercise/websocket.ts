import { ExerciseSocket, ExerciseServer } from '../exercise-server';
import { clientMap } from './client-map';
import { Client } from './clients';
import { exerciseMap } from './exercise-map';
import { ExerciseWrapper } from './exercise-wrapper';
import {
    registerGetStateHandler,
    registerJoinExerciseHandler,
    registerProposeActionHandler,
} from './websocket-handler';

export const setupWebsocket = (io: ExerciseServer): void => {
    const PORT = 3200;

    io.listen(PORT);

    io.on('connection', (socket) => {
        console.log('a user connected');
        registerClient(socket);
    });

    const exerciseWrapper = new ExerciseWrapper()
    exerciseMap.set('abcdefghijk', exerciseWrapper);
    const registerClient = (client: ExerciseSocket): void => {
        // Add client
        clientMap.set(client, new Client(client));

        // register handlers
        registerGetStateHandler(io, client);
        registerProposeActionHandler(io, client);
        registerJoinExerciseHandler(io, client);
    };
};
